const axios = require('axios');

class TranslationService {
    constructor() {
        this.translatorKey = process.env.AZURE_TRANSLATOR_KEY;
        this.translatorRegion = process.env.AZURE_TRANSLATOR_REGION;
        this.endpoint = process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com/';
    }

    async translate(text, targetLanguage, sourceLanguage = 'en') {
        try {
            const response = await axios.post(
                `${this.endpoint}/translate?api-version=3.0&from=${sourceLanguage}&to=${targetLanguage}`,
                [{ text }],
                {
                    headers: {
                        'Ocp-Apim-Subscription-Key': this.translatorKey,
                        'Ocp-Apim-Subscription-Region': this.translatorRegion,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data[0].translations[0].text;
        } catch (error) {
            console.error('Translation Error:', error.response?.data || error.message);
            // Return original text if translation fails
            return text;
        }
    }

    async translateBatch(texts, targetLanguage, sourceLanguage = 'en') {
        try {
            const textObjects = texts.map(text => ({ text }));

            const response = await axios.post(
                `${this.endpoint}/translate?api-version=3.0&from=${sourceLanguage}&to=${targetLanguage}`,
                textObjects,
                {
                    headers: {
                        'Ocp-Apim-Subscription-Key': this.translatorKey,
                        'Ocp-Apim-Subscription-Region': this.translatorRegion,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.map(item => item.translations[0].text);
        } catch (error) {
            console.error('Batch Translation Error:', error.response?.data || error.message);
            return texts;
        }
    }
}

module.exports = new TranslationService();
