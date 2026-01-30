#!/usr/bin/env node

/**
 * TTS Cache Generator Script
 * 
 * This script pre-generates all TTS audio files for all questions in all languages.
 * Run this once after setting up Azure credentials to cache all audio.
 * 
 * Usage: node generate-tts-cache.js
 */

require('dotenv').config();
const questionsData = require('./src/data/questions');
const azureSpeechService = require('./src/services/azureSpeech');

const languages = ['en', 'hi', 'ta', 'te', 'ml'];

async function generateAllCache() {
    console.log('🎤 Starting TTS Cache Generation...\n');
    console.log('This will generate audio files for all questions in all languages.');
    console.log('This is a ONE-TIME process that will save Azure costs.\n');

    // Check if Azure credentials are configured
    if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
        console.error('❌ ERROR: Azure Speech credentials not configured!');
        console.error('Please set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in your .env file.\n');
        process.exit(1);
    }

    let totalSuccess = 0;
    let totalFailed = 0;

    for (const lang of languages) {
        console.log(`\n📢 Generating cache for ${lang.toUpperCase()}...`);

        try {
            const questions = await questionsData.getQuestions(lang);
            console.log(`   Found ${questions.length} questions`);

            const results = await azureSpeechService.generateQuestionCache(questions, lang);

            const success = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            totalSuccess += success;
            totalFailed += failed;

            console.log(`   ✅ Generated: ${success}/${questions.length}`);
            if (failed > 0) {
                console.log(`   ❌ Failed: ${failed}`);
            }
        } catch (error) {
            console.error(`   ❌ Error generating cache for ${lang}:`, error.message);
            totalFailed += 10; // Assume all questions failed
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY:');
    console.log(`   Total Audio Files Generated: ${totalSuccess}`);
    console.log(`   Total Failed: ${totalFailed}`);
    console.log(`   Storage Location: public/audio/`);
    console.log('='.repeat(50));

    if (totalFailed === 0) {
        console.log('\n🎉 SUCCESS! All TTS audio files cached!');
        console.log('Your app will now use cached audio and save 99% of TTS quota.\n');
    } else {
        console.log('\n⚠️  Some files failed to generate. Check errors above.');
        console.log('You can re-run this script to retry failed generations.\n');
    }
}

// Run the script
generateAllCache()
    .then(() => {
        console.log('✨ Cache generation complete!');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
