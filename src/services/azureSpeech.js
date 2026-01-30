const sdk = require('microsoft-cognitiveservices-speech-sdk');
const fs = require('fs');
const path = require('path');

class AzureSpeechService {
    constructor() {
        this.speechKey = process.env.AZURE_SPEECH_KEY;
        this.speechRegion = process.env.AZURE_SPEECH_REGION;
        this.cacheDir = path.join(__dirname, '../../public/audio');

        // Validate configuration on startup
        this.validateConfig();
    }

    validateConfig() {
        const timestamp = new Date().toISOString();
        const missing = [];

        if (!this.speechKey) missing.push('AZURE_SPEECH_KEY');
        if (!this.speechRegion) missing.push('AZURE_SPEECH_REGION');

        if (missing.length > 0) {
            console.error(`[${timestamp}] [AZURE SPEECH] Missing configuration:`, missing.join(', '));
            console.error(`[${timestamp}] [AZURE SPEECH] TTS and STT features will not work!`);
        } else {
            console.log(`[${timestamp}] [AZURE SPEECH] Configuration validated successfully`);
            console.log(`[${timestamp}] [AZURE SPEECH] Region: ${this.speechRegion}`);
            console.log(`[${timestamp}] [AZURE SPEECH] Cache directory: ${this.cacheDir}`);
        }
    }

    // Language to voice mapping
    getVoiceForLanguage(language) {
        const voiceMap = {
            'en': 'en-US-JennyNeural',
            'hi': 'hi-IN-SwaraNeural',
            'ta': 'ta-IN-PallaviNeural',
            'te': 'te-IN-ShrutiNeural',
            'ml': 'ml-IN-SobhanaNeural'
        };
        return voiceMap[language] || 'en-US-JennyNeural';
    }

    // Language to locale mapping
    getLocaleForLanguage(language) {
        const localeMap = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'ml': 'ml-IN'
        };
        return localeMap[language] || 'en-US';
    }

    async textToSpeech(text, language = 'en', cacheKey = null) {
        const timestamp = new Date().toISOString();
        try {
            // Validate inputs
            if (!text) {
                throw new Error('Text is required for TTS');
            }

            if (!this.speechKey || !this.speechRegion) {
                throw new Error('Azure Speech credentials not configured');
            }

            console.log(`[${timestamp}] [TTS] Request:`, {
                language,
                cacheKey,
                textLength: text.length,
                voice: this.getVoiceForLanguage(language)
            });

            // Check cache first if cacheKey provided
            if (cacheKey) {
                const cachedAudio = this.getCachedAudio(language, cacheKey);
                if (cachedAudio) {
                    console.log(`[${timestamp}] [TTS] Using cached audio for ${language}/${cacheKey}`);
                    return { audio: cachedAudio, cached: true };
                }
            }

            const speechConfig = sdk.SpeechConfig.fromSubscription(this.speechKey, this.speechRegion);
            speechConfig.speechSynthesisVoiceName = this.getVoiceForLanguage(language);
            speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

            const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

            return new Promise((resolve, reject) => {
                synthesizer.speakTextAsync(
                    text,
                    result => {
                        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                            console.log(`[${timestamp}] [TTS] Synthesis successful:`, {
                                language,
                                audioSize: result.audioData.byteLength,
                                cached: !!cacheKey
                            });

                            // Convert audio data to base64
                            const audioData = Buffer.from(result.audioData).toString('base64');

                            // Cache if cacheKey provided
                            if (cacheKey) {
                                this.cacheAudio(language, cacheKey, result.audioData);
                            }

                            synthesizer.close();
                            resolve({ audio: audioData, cached: false });
                        } else {
                            console.error(`[${timestamp}] [ERROR] [TTS] Synthesis failed:`, {
                                reason: result.reason,
                                errorDetails: result.errorDetails,
                                language,
                                cacheKey
                            });
                            synthesizer.close();
                            reject(new Error(`TTS failed: ${result.errorDetails}`));
                        }
                    },
                    error => {
                        console.error(`[${timestamp}] [ERROR] [TTS] Synthesis error:`, {
                            message: error.message || error,
                            language,
                            cacheKey
                        });
                        synthesizer.close();
                        reject(error);
                    }
                );
            });
        } catch (error) {
            console.error(`[${timestamp}] [ERROR] [TTS] Unexpected error:`, {
                message: error.message,
                stack: error.stack,
                language,
                cacheKey,
                textLength: text?.length
            });
            throw error;
        }
    }

    // Cache audio to file system
    cacheAudio(language, cacheKey, audioBuffer) {
        const timestamp = new Date().toISOString();
        try {
            const langDir = path.join(this.cacheDir, language);
            const filePath = path.join(langDir, `${cacheKey}.mp3`);

            // Ensure directory exists
            if (!fs.existsSync(langDir)) {
                fs.mkdirSync(langDir, { recursive: true });
                console.log(`[${timestamp}] [CACHE] Created directory: ${langDir}`);
            }

            fs.writeFileSync(filePath, Buffer.from(audioBuffer));
            console.log(`[${timestamp}] [CACHE] Cached audio: ${language}/${cacheKey}.mp3 (${audioBuffer.byteLength} bytes)`);
        } catch (error) {
            console.error(`[${timestamp}] [ERROR] [CACHE] Failed to cache audio:`, {
                message: error.message,
                language,
                cacheKey,
                path: path.join(this.cacheDir, language)
            });
        }
    }

    // Get cached audio
    getCachedAudio(language, cacheKey) {
        const timestamp = new Date().toISOString();
        try {
            const filePath = path.join(this.cacheDir, language, `${cacheKey}.mp3`);

            if (fs.existsSync(filePath)) {
                const audioBuffer = fs.readFileSync(filePath);
                console.log(`[${timestamp}] [CACHE] Retrieved cached audio: ${language}/${cacheKey}.mp3 (${audioBuffer.length} bytes)`);
                return audioBuffer.toString('base64');
            }

            console.log(`[${timestamp}] [CACHE] No cached audio found: ${language}/${cacheKey}.mp3`);
            return null;
        } catch (error) {
            console.error(`[${timestamp}] [ERROR] [CACHE] Failed to read cached audio:`, {
                message: error.message,
                language,
                cacheKey
            });
            return null;
        }
    }

    // Generate cache for all questions
    async generateQuestionCache(questions, language) {
        console.log(`Generating TTS cache for ${language}...`);
        const results = [];

        for (const question of questions) {
            const cacheKey = `question-${question.id}`;
            try {
                await this.textToSpeech(question.question, language, cacheKey);
                results.push({ id: question.id, success: true });
            } catch (error) {
                console.error(`Failed to cache question ${question.id} in ${language}:`, error);
                results.push({ id: question.id, success: false, error: error.message });
            }
        }

        return results;
    }

    async speechToText(audioData, language = 'en') {
        const timestamp = new Date().toISOString();
        try {
            // Validate inputs
            if (!audioData) {
                throw new Error('Audio data is required for STT');
            }

            if (!this.speechKey || !this.speechRegion) {
                throw new Error('Azure Speech credentials not configured');
            }

            console.log(`[${timestamp}] [STT] Request:`, {
                language,
                audioDataSize: audioData.length,
                locale: this.getLocaleForLanguage(language)
            });

            const speechConfig = sdk.SpeechConfig.fromSubscription(this.speechKey, this.speechRegion);
            speechConfig.speechRecognitionLanguage = this.getLocaleForLanguage(language);

            // Convert base64 audio to buffer
            const audioBuffer = Buffer.from(audioData, 'base64');
            console.log(`[${timestamp}] [STT] Audio buffer size: ${audioBuffer.length} bytes`);

            // Create audio format for 16kHz 16-bit mono PCM
            const audioFormat = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);

            // Create push stream with format
            const pushStream = sdk.AudioInputStream.createPushStream(audioFormat);
            pushStream.write(audioBuffer);
            pushStream.close();

            const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
            const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

            return new Promise((resolve, reject) => {
                recognizer.recognizeOnceAsync(
                    result => {
                        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
                            console.log(`[${timestamp}] [STT] Recognition successful:`, {
                                language,
                                textLength: result.text.length,
                                preview: result.text.substring(0, 50)
                            });
                            recognizer.close();
                            resolve(result.text);
                        } else {
                            console.error(`[${timestamp}] [ERROR] [STT] Recognition failed:`, {
                                reason: result.reason,
                                errorDetails: result.errorDetails,
                                language
                            });
                            recognizer.close();
                            reject(new Error(result.errorDetails || 'Speech not recognized'));
                        }
                    },
                    error => {
                        console.error(`[${timestamp}] [ERROR] [STT] Recognition error:`, {
                            message: error.message || error,
                            language
                        });
                        recognizer.close();
                        reject(error);
                    }
                );
            });
        } catch (error) {
            console.error(`[${timestamp}] [ERROR] [STT] Unexpected error:`, {
                message: error.message,
                stack: error.stack,
                language,
                audioDataSize: audioData?.length
            });
            throw error;
        }
    }
}

module.exports = new AzureSpeechService();
