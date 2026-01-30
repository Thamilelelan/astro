require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Increase body size limit for audio data (default is 100kb, audio files can be larger)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

app.use(express.static('public'));

// Import routes
const azureAIService = require('./src/services/azureAI');
const azureSpeechService = require('./src/services/azureSpeech');
const translationService = require('./src/services/translation');
const questionsData = require('./src/data/questions');

// API Routes

// Get questions in selected language
app.get('/api/questions/:language', async (req, res) => {
    const timestamp = new Date().toISOString();
    try {
        const { language } = req.params;
        console.log(`[${timestamp}] [QUESTIONS] Fetching questions for language: ${language}`);

        if (!['en', 'hi', 'ta', 'te', 'ml'].includes(language)) {
            console.warn(`[${timestamp}] [QUESTIONS] Invalid language requested: ${language}`);
            return res.status(400).json({
                success: false,
                error: 'Invalid language. Supported: en, hi, ta, te, ml'
            });
        }

        const questions = await questionsData.getQuestions(language);
        console.log(`[${timestamp}] [QUESTIONS] Successfully fetched ${questions.length} questions`);
        res.json({ success: true, questions });
    } catch (error) {
        console.error(`[${timestamp}] [ERROR] [QUESTIONS] Failed to fetch questions:`, {
            message: error.message,
            stack: error.stack,
            language: req.params.language
        });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch questions',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get AI recommendation based on answers
app.post('/api/analyze', async (req, res) => {
    const timestamp = new Date().toISOString();
    try {
        const { answers, language } = req.body;
        console.log(`[${timestamp}] [ANALYZE] Starting analysis for ${answers?.length || 0} answers in language: ${language}`);

        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            console.warn(`[${timestamp}] [ANALYZE] Invalid answers payload`);
            return res.status(400).json({
                success: false,
                error: 'Answers array is required and must not be empty'
            });
        }

        const recommendation = await azureAIService.getRecommendation(answers, language);
        console.log(`[${timestamp}] [ANALYZE] Successfully generated recommendation:`, recommendation.primary.stream);
        res.json({ success: true, recommendation });
    } catch (error) {
        console.error(`[${timestamp}] [ERROR] [ANALYZE] Failed to analyze answers:`, {
            message: error.message,
            stack: error.stack,
            answersCount: req.body?.answers?.length,
            language: req.body?.language
        });
        res.status(500).json({
            success: false,
            error: 'Failed to analyze answers',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Text to Speech (with caching support)
app.post('/api/tts', async (req, res) => {
    const timestamp = new Date().toISOString();
    try {
        const { text, language, cacheKey } = req.body;
        console.log(`[${timestamp}] [TTS] Processing TTS request:`, {
            language,
            cacheKey,
            textLength: text?.length || 0
        });

        if (!text || !language) {
            console.warn(`[${timestamp}] [TTS] Missing required parameters`);
            return res.status(400).json({
                success: false,
                error: 'Text and language are required'
            });
        }

        const audioData = await azureSpeechService.textToSpeech(text, language, cacheKey);
        console.log(`[${timestamp}] [TTS] Successfully generated audio:`, {
            cached: audioData.cached || false,
            audioSize: audioData.audio?.length || 0
        });
        res.json({ success: true, audioData });
    } catch (error) {
        console.error(`[${timestamp}] [ERROR] [TTS] Failed to generate speech:`, {
            message: error.message,
            stack: error.stack,
            language: req.body?.language,
            cacheKey: req.body?.cacheKey,
            textLength: req.body?.text?.length
        });
        res.status(500).json({
            success: false,
            error: 'Failed to generate speech',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Generate TTS cache for all questions (admin endpoint)
app.post('/api/cache/generate', async (req, res) => {
    try {
        const { language } = req.body;
        const questions = await questionsData.getQuestions(language);
        const results = await azureSpeechService.generateQuestionCache(questions, language);
        res.json({ success: true, results, language });
    } catch (error) {
        console.error('Error generating cache:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Generate cache for all languages (convenience endpoint)
app.post('/api/cache/generate-all', async (req, res) => {
    try {
        const languages = ['en', 'hi', 'ta', 'te', 'ml'];
        const allResults = {};

        for (const lang of languages) {
            console.log(`Generating cache for ${lang}...`);
            const questions = await questionsData.getQuestions(lang);
            allResults[lang] = await azureSpeechService.generateQuestionCache(questions, lang);
        }

        res.json({ success: true, results: allResults });
    } catch (error) {
        console.error('Error generating all caches:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Speech to Text
app.post('/api/stt', async (req, res) => {
    const timestamp = new Date().toISOString();
    try {
        const { audioData, language } = req.body;
        console.log(`[${timestamp}] [STT] Processing STT request:`, {
            language,
            audioDataSize: audioData?.length || 0
        });

        if (!audioData || !language) {
            console.warn(`[${timestamp}] [STT] Missing required parameters`);
            return res.status(400).json({
                success: false,
                error: 'Audio data and language are required'
            });
        }

        const text = await azureSpeechService.speechToText(audioData, language);
        console.log(`[${timestamp}] [STT] Successfully transcribed audio:`, {
            textLength: text?.length || 0,
            preview: text?.substring(0, 50)
        });
        res.json({ success: true, text });
    } catch (error) {
        console.error(`[${timestamp}] [ERROR] [STT] Failed to transcribe speech:`, {
            message: error.message,
            stack: error.stack,
            language: req.body?.language,
            audioDataSize: req.body?.audioData?.length
        });
        res.status(500).json({
            success: false,
            error: 'Failed to transcribe speech',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Translate text
app.post('/api/translate', async (req, res) => {
    try {
        const { text, targetLanguage } = req.body;
        const translatedText = await translationService.translate(text, targetLanguage);
        res.json({ success: true, translatedText });
    } catch (error) {
        console.error('Error translating:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve index.html for all other routes (Express v5 compatible)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [FATAL ERROR] Unhandled error:`, {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    res.status(err.status || 500).json({
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 CSE Career Path Predictor Server Running!`);
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
