// Audio processing utilities for speech recognition
class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.mediaStream = null;
        this.scriptProcessor = null;
        this.audioChunks = [];
        this.analyser = null;
        this.silenceDetectionTimeout = null;
        this.onSilenceDetected = null;
        this.silenceThreshold = -60; // dB (lowered for better sensitivity)
        this.silenceDuration = 1200; // ms of silence before auto-stop (reduced)
        this.lastSoundTime = Date.now();
        this.isMonitoringSilence = false;
        this.speechDetected = false; // Only start silence detection after speech is detected
        this.minimumRecordingTime = 500; // ms - minimum recording time before silence detection
        this.maximumRecordingTime = 10000; // ms - maximum recording time (10 seconds safety)
        this.recordingStartTime = null;
    }

    async startRecording() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000
            });

            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            const source = this.audioContext.createMediaStreamSource(this.mediaStream);

            // Create analyser for voice activity detection
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;

            // Create script processor for audio capture
            this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
            this.audioChunks = [];
            this.lastSoundTime = Date.now();
            this.isMonitoringSilence = true;

            this.scriptProcessor.onaudioprocess = (event) => {
                const inputData = event.inputBuffer.getChannelData(0);
                // Convert float32 to int16
                const int16Data = this.floatTo16BitPCM(inputData);
                this.audioChunks.push(int16Data);
            };

            source.connect(this.analyser);
            source.connect(this.scriptProcessor);
            this.scriptProcessor.connect(this.audioContext.destination);

            // Initialize flags
            this.recordingStartTime = Date.now();
            this.speechDetected = false;
            this.lastSoundTime = Date.now();
            this.isMonitoringSilence = true;

            // Start monitoring silence
            this.startSilenceDetection();

            return true;
        } catch (error) {
            console.error('Error starting recording:', error);
            throw error;
        }
    }

    stopRecording() {
        if (this.scriptProcessor) {
            this.scriptProcessor.disconnect();
        }
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }

        // Combine all chunks
        const totalLength = this.audioChunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Int16Array(totalLength);
        let offset = 0;
        for (const chunk of this.audioChunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }

        // Create WAV file
        return this.createWavBlob(result, 16000);
    }

    floatTo16BitPCM(float32Array) {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return int16Array;
    }

    createWavBlob(samples, sampleRate) {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);

        // WAV header
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        this.writeString(view, 8, 'WAVE');
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // PCM chunk size
        view.setUint16(20, 1, true); // Audio format (PCM)
        view.setUint16(22, 1, true); // Number of channels
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true); // Byte rate
        view.setUint16(32, 2, true); // Block align
        view.setUint16(34, 16, true); // Bits per sample
        this.writeString(view, 36, 'data');
        view.setUint32(40, samples.length * 2, true);

        // Write PCM samples
        const offset = 44;
        for (let i = 0; i < samples.length; i++) {
            view.setInt16(offset + i * 2, samples[i], true);
        }

        return new Blob([buffer], { type: 'audio/wav' });
    }

    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    startSilenceDetection() {
        if (!this.analyser || !this.isMonitoringSilence) return;

        const checkAudioLevel = () => {
            if (!this.isMonitoringSilence) return;

            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Float32Array(bufferLength);
            this.analyser.getFloatFrequencyData(dataArray);

            // Calculate average volume in dB
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const averageVolume = sum / bufferLength;

            // Check if we're still in the grace period (minimum recording time)
            const recordingDuration = Date.now() - this.recordingStartTime;
            const inGracePeriod = recordingDuration < this.minimumRecordingTime;

            // Safety: Maximum recording time exceeded
            if (recordingDuration > this.maximumRecordingTime) {
                console.log('Maximum recording time reached, auto-stopping...');
                this.isMonitoringSilence = false;
                if (this.onSilenceDetected) {
                    this.onSilenceDetected();
                }
                return;
            }

            // Detect if sound/speech is present
            if (averageVolume > this.silenceThreshold) {
                this.lastSoundTime = Date.now();
                if (!this.speechDetected) {
                    console.log('Speech detected! Volume:', averageVolume.toFixed(2), 'dB');
                    this.speechDetected = true;
                }
            } else if (this.speechDetected && !inGracePeriod) {
                // Only check for silence if:
                // 1. Speech has been detected at least once
                // 2. We're past the minimum recording time
                const silenceDuration = Date.now() - this.lastSoundTime;
                if (silenceDuration > this.silenceDuration && this.onSilenceDetected) {
                    console.log('Silence detected for', this.silenceDuration, 'ms. Auto-stopping...');
                    this.isMonitoringSilence = false;
                    this.onSilenceDetected();
                    return;
                }
            }

            // Continue monitoring
            requestAnimationFrame(checkAudioLevel);
        };

        checkAudioLevel();
    }

    stopSilenceDetection() {
        this.isMonitoringSilence = false;
        if (this.silenceDetectionTimeout) {
            clearTimeout(this.silenceDetectionTimeout);
            this.silenceDetectionTimeout = null;
        }
    }
}

// Export for use in app.js
window.AudioProcessor = AudioProcessor;
