const translationService = require('../services/translation');

// Question bank in English (base language)
const questionsEnglish = [
    {
        id: 1,
        question: "What type of problems do you enjoy solving the most?",
        options: [
            "Protecting systems and finding security vulnerabilities",
            "Creating visual designs and user interfaces",
            "Analyzing data patterns and making predictions",
            "Building and connecting hardware devices"
        ]
    },
    {
        id: 2,
        question: "Which activity sounds most interesting to you?",
        options: [
            "Hacking ethically to test security systems",
            "Training AI models to recognize patterns",
            "Developing mobile or web applications",
            "Managing cloud infrastructure and servers"
        ]
    },
    {
        id: 3,
        question: "What kind of work environment appeals to you?",
        options: [
            "Working independently on complex analytical tasks",
            "Collaborating in teams to build products",
            "Research-focused with continuous learning",
            "Fast-paced with automation and deployments"
        ]
    },
    {
        id: 4,
        question: "Which subject or skill do you find most engaging?",
        options: [
            "Mathematics and statistics",
            "Creative design and user experience",
            "System architecture and optimization",
            "Networking and distributed systems"
        ]
    },
    {
        id: 5,
        question: "What motivates you in a career?",
        options: [
            "Making the digital world safer",
            "Creating innovative solutions using AI",
            "Building applications used by millions",
            "Working with cutting-edge technology"
        ]
    },
    {
        id: 6,
        question: "How do you prefer to learn new technologies?",
        options: [
            "Hands-on experimentation and breaking things",
            "Reading research papers and documentation",
            "Building projects from tutorials",
            "Solving real-world problems practically"
        ]
    },
    {
        id: 7,
        question: "Which type of project excites you the most?",
        options: [
            "Building a secure authentication system",
            "Creating a game with immersive graphics",
            "Developing a chatbot using machine learning",
            "Setting up automated deployment pipelines"
        ]
    },
    {
        id: 8,
        question: "What kind of impact do you want to make?",
        options: [
            "Prevent cyber attacks and protect privacy",
            "Make technology more accessible and user-friendly",
            "Solve complex problems with data insights",
            "Enable seamless connectivity between devices"
        ]
    },
    {
        id: 9,
        question: "Which skill are you most interested in developing?",
        options: [
            "Penetration testing and ethical hacking",
            "Deep learning and neural networks",
            "Full-stack web development",
            "Blockchain and decentralized systems"
        ]
    },
    {
        id: 10,
        question: "What type of challenges do you enjoy?",
        options: [
            "Finding vulnerabilities before attackers do",
            "Optimizing algorithms for better performance",
            "Creating responsive and beautiful interfaces",
            "Scaling systems to handle millions of users"
        ]
    }
];

class QuestionsData {
    constructor() {
        this.questionsCache = {
            en: questionsEnglish
        };
    }

    async getQuestions(language = 'en') {
        // Return cached if available
        if (this.questionsCache[language]) {
            return this.questionsCache[language];
        }

        // Translate questions to target language
        try {
            const translatedQuestions = await this.translateQuestions(questionsEnglish, language);
            this.questionsCache[language] = translatedQuestions;
            return translatedQuestions;
        } catch (error) {
            console.error('Error translating questions:', error);
            // Fallback to English
            return questionsEnglish;
        }
    }

    async translateQuestions(questions, targetLanguage) {
        const translatedQuestions = [];

        for (const question of questions) {
            // Translate question text
            const translatedQuestion = await translationService.translate(
                question.question,
                targetLanguage
            );

            // Translate all options
            const translatedOptions = await translationService.translateBatch(
                question.options,
                targetLanguage
            );

            translatedQuestions.push({
                id: question.id,
                question: translatedQuestion,
                options: translatedOptions
            });
        }

        return translatedQuestions;
    }

    // Get question by ID
    getQuestionById(id, language = 'en') {
        const questions = this.questionsCache[language] || questionsEnglish;
        return questions.find(q => q.id === id);
    }

    // Clear cache (useful for development)
    clearCache() {
        this.questionsCache = {
            en: questionsEnglish
        };
    }
}

module.exports = new QuestionsData();
