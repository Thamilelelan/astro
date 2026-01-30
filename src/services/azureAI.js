const axios = require('axios');

class AzureAIService {
    constructor() {
        this.endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        this.apiKey = process.env.AZURE_OPENAI_API_KEY;
        this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

        // Validate configuration on startup
        this.validateConfig();
    }

    validateConfig() {
        const timestamp = new Date().toISOString();
        const missing = [];

        if (!this.endpoint) missing.push('AZURE_OPENAI_ENDPOINT');
        if (!this.apiKey) missing.push('AZURE_OPENAI_API_KEY');
        if (!this.deploymentName) missing.push('AZURE_OPENAI_DEPLOYMENT_NAME');

        if (missing.length > 0) {
            console.error(`[${timestamp}] [AZURE AI] Missing configuration:`, missing.join(', '));
            console.warn(`[${timestamp}] [AZURE AI] Will use rule-based fallback for recommendations`);
        } else {
            console.log(`[${timestamp}] [AZURE AI] Configuration validated successfully`);
            console.log(`[${timestamp}] [AZURE AI] Endpoint: ${this.endpoint}`);
            console.log(`[${timestamp}] [AZURE AI] Deployment: ${this.deploymentName}`);
        }
    }

    // CSE stream definitions
    getStreamDefinitions() {
        return {
            'cyber_security': {
                name: 'Cyber Security',
                traits: ['analytical', 'detail-oriented', 'problem-solver', 'security-conscious', 'ethical'],
                description: 'Protecting systems, networks, and data from cyber threats'
            },
            'ai_ml': {
                name: 'Artificial Intelligence & Machine Learning',
                traits: ['mathematical', 'innovative', 'research-oriented', 'data-driven', 'curious'],
                description: 'Building intelligent systems that can learn and make decisions'
            },
            'full_stack': {
                name: 'Full Stack Development',
                traits: ['versatile', 'creative', 'user-focused', 'problem-solver', 'collaborative'],
                description: 'Building complete web applications from frontend to backend'
            },
            'data_science': {
                name: 'Data Science',
                traits: ['analytical', 'mathematical', 'curious', 'detail-oriented', 'research-oriented'],
                description: 'Extracting insights and knowledge from data'
            },
            'cloud_computing': {
                name: 'Cloud Computing',
                traits: ['systematic', 'scalability-focused', 'infrastructure-minded', 'efficient', 'organized'],
                description: 'Managing and deploying applications on cloud platforms'
            },
            'devops': {
                name: 'DevOps',
                traits: ['systematic', 'automation-focused', 'collaborative', 'efficient', 'process-oriented'],
                description: 'Streamlining software development and deployment processes'
            },
            'game_dev': {
                name: 'Game Development',
                traits: ['creative', 'innovative', 'user-focused', 'detail-oriented', 'passionate'],
                description: 'Creating interactive gaming experiences'
            },
            'iot': {
                name: 'Internet of Things (IoT)',
                traits: ['innovative', 'hardware-interested', 'problem-solver', 'practical', 'curious'],
                description: 'Connecting physical devices to the internet'
            },
            'blockchain': {
                name: 'Blockchain',
                traits: ['security-conscious', 'innovative', 'mathematical', 'detail-oriented', 'ethical'],
                description: 'Building decentralized and secure applications'
            },
            'mobile_dev': {
                name: 'Mobile App Development',
                traits: ['creative', 'user-focused', 'detail-oriented', 'versatile', 'design-conscious'],
                description: 'Creating applications for mobile devices'
            },
            'networks': {
                name: 'Computer Networks',
                traits: ['systematic', 'problem-solver', 'detail-oriented', 'infrastructure-minded', 'analytical'],
                description: 'Designing and managing network infrastructure'
            }
        };
    }

    async getRecommendation(answers, language = 'en') {
        const timestamp = new Date().toISOString();
        try {
            // Check if Azure OpenAI is configured
            if (!this.endpoint || !this.apiKey || !this.deploymentName) {
                console.warn(`[${timestamp}] [AZURE AI] Configuration missing, using rule-based fallback`);
                return this.getRuleBasedRecommendation(answers, language);
            }

            console.log(`[${timestamp}] [AZURE AI] Starting recommendation analysis for ${answers.length} answers`);

            // Build the prompt for Azure OpenAI
            const prompt = this.buildPrompt(answers);

            // The endpoint from .env already includes the full path
            // Format: https://astro-bot.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview
            const apiUrl = this.endpoint;

            console.log(`[${timestamp}] [AZURE AI] Calling API:`, apiUrl);

            // Call Azure OpenAI API
            const response = await axios.post(
                apiUrl,
                {
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a career counselor specializing in Computer Science and Engineering career paths. Analyze student responses and recommend suitable CSE specializations based on their psychology, interests, and traits.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': this.apiKey
                    },
                    timeout: 30000 // 30 second timeout
                }
            );

            console.log(`[${timestamp}] [AZURE AI] API call successful, parsing response...`);
            const aiResponse = response.data.choices[0].message.content;
            return this.parseRecommendation(aiResponse, language);

        } catch (error) {
            console.error(`[${timestamp}] [ERROR] [AZURE AI] API call failed:`, {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method
                }
            });

            console.warn(`[${timestamp}] [AZURE AI] Falling back to rule-based recommendation`);
            // Fallback to rule-based recommendation if API fails
            return this.getRuleBasedRecommendation(answers, language);
        }
    }

    buildPrompt(answers) {
        const streams = this.getStreamDefinitions();
        const streamsList = Object.values(streams).map(s => s.name).join(', ');

        return `Based on the following student responses to career assessment questions, recommend the TOP 3 most suitable Computer Science specializations from this list: ${streamsList}.

Student Responses:
${answers.map((answer, index) => `Question ${index + 1}: ${answer.question}\nAnswer: ${answer.answer}\n`).join('\n')}

Analyze the student's:
1. Problem-solving approach
2. Interest areas
3. Personality traits
4. Learning preferences
5. Career motivations

Provide recommendations in this exact JSON format:
{
    "primary": {
        "stream": "Stream Name",
        "match_percentage": 85,
        "reasons": ["reason 1", "reason 2", "reason 3"]
    },
    "secondary": {
        "stream": "Stream Name",
        "match_percentage": 70,
        "reasons": ["reason 1", "reason 2"]
    },
    "tertiary": {
        "stream": "Stream Name",
        "match_percentage": 60,
        "reasons": ["reason 1", "reason 2"]
    }
}`;
    }

    parseRecommendation(aiResponse, language) {
        try {
            // Extract JSON from response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid AI response format');
        } catch (error) {
            console.error('Error parsing AI response:', error);
            return null;
        }
    }

    // Fallback rule-based recommendation
    getRuleBasedRecommendation(answers, language) {
        // Simple scoring system based on keywords
        const scores = {};
        const streams = this.getStreamDefinitions();

        // Initialize scores
        Object.keys(streams).forEach(key => {
            scores[key] = 0;
        });

        // Analyze answers
        answers.forEach(answer => {
            const answerLower = answer.answer.toLowerCase();

            // Keyword matching (simplified)
            if (answerLower.includes('security') || answerLower.includes('protect') || answerLower.includes('ethical')) {
                scores.cyber_security += 10;
                scores.blockchain += 5;
            }
            if (answerLower.includes('ai') || answerLower.includes('machine learning') || answerLower.includes('intelligence')) {
                scores.ai_ml += 10;
                scores.data_science += 5;
            }
            if (answerLower.includes('website') || answerLower.includes('web') || answerLower.includes('frontend') || answerLower.includes('backend')) {
                scores.full_stack += 10;
            }
            if (answerLower.includes('data') || answerLower.includes('analysis') || answerLower.includes('statistics')) {
                scores.data_science += 10;
                scores.ai_ml += 5;
            }
            if (answerLower.includes('game') || answerLower.includes('graphics') || answerLower.includes('3d')) {
                scores.game_dev += 10;
            }
            if (answerLower.includes('mobile') || answerLower.includes('app') || answerLower.includes('android') || answerLower.includes('ios')) {
                scores.mobile_dev += 10;
            }
            if (answerLower.includes('cloud') || answerLower.includes('aws') || answerLower.includes('azure')) {
                scores.cloud_computing += 10;
                scores.devops += 5;
            }
            if (answerLower.includes('hardware') || answerLower.includes('sensor') || answerLower.includes('device')) {
                scores.iot += 10;
            }
            if (answerLower.includes('network') || answerLower.includes('router') || answerLower.includes('protocol')) {
                scores.networks += 10;
            }
            if (answerLower.includes('automation') || answerLower.includes('deploy') || answerLower.includes('ci/cd')) {
                scores.devops += 10;
            }
        });

        // Get top 3 streams
        const sortedStreams = Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        return {
            primary: {
                stream: streams[sortedStreams[0][0]].name,
                match_percentage: Math.min(85, sortedStreams[0][1] * 2),
                reasons: streams[sortedStreams[0][0]].traits.slice(0, 3)
            },
            secondary: {
                stream: streams[sortedStreams[1][0]].name,
                match_percentage: Math.min(70, sortedStreams[1][1] * 2),
                reasons: streams[sortedStreams[1][0]].traits.slice(0, 2)
            },
            tertiary: {
                stream: streams[sortedStreams[2][0]].name,
                match_percentage: Math.min(60, sortedStreams[2][1] * 2),
                reasons: streams[sortedStreams[2][0]].traits.slice(0, 2)
            }
        };
    }
}

module.exports = new AzureAIService();
