# CSE Career Path Predictor 🎓

An AI-powered career guidance application that helps 11th and 12th standard students discover their ideal Computer Science Engineering (CSE) specialization through an interactive multilingual assessment.

## 🌟 Features

- **10-Question Assessment**: Quick 3-5 minute career aptitude test
- **Multilingual Support**: Available in English, Hindi, Tamil, Telugu, and Malayalam
- **Text-to-Speech (TTS)**: Questions read aloud in selected language
- **Speech-to-Text (STT)**: Voice-based answer input
- **AI-Powered Recommendations**: Personalized career suggestions based on psychology and interests
- **11 CSE Specializations**: Covers all major computer science streams

## 🎯 Supported CSE Streams

1. Cyber Security
2. Artificial Intelligence & Machine Learning
3. Full Stack Development
4. Data Science
5. Cloud Computing
6. DevOps
7. Game Development
8. Internet of Things (IoT)
9. Blockchain
10. Mobile App Development
11. Computer Networks

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI Services**:
  - Azure OpenAI (GPT models)
  - Azure Cognitive Services Speech (TTS/STT)
  - Azure Translator API

## 📋 Prerequisites

- Node.js (v14 or higher)
- Azure account with free credits
- Azure services configured:
  - Azure OpenAI Service
  - Azure Speech Services
  - Azure Translator

## 🚀 Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd astro
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment Variables

Create a \`.env\` file in the root directory:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit \`.env\` and add your Azure credentials:

\`\`\`env

# Azure OpenAI Configuration

AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name

# Azure Speech Services Configuration

AZURE_SPEECH_KEY=your-speech-key-here
AZURE_SPEECH_REGION=your-region

# Azure Translator Configuration

AZURE_TRANSLATOR_KEY=your-translator-key-here
AZURE_TRANSLATOR_REGION=your-region
AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com/

# Server Configuration

PORT=3000
NODE_ENV=development
\`\`\`

### 4. Start the Server

\`\`\`bash
npm start
\`\`\`

The application will be available at: **http://localhost:3000**

### 5. Generate TTS Cache (Highly Recommended)

To save 99% of Azure TTS costs, pre-generate audio cache:

\`\`\`bash
npm run generate-cache
\`\`\`

This creates cached audio files for all questions in all languages (~2.5MB total).
After this, your app will serve cached audio instead of calling Azure TTS API.

See [TTS_CACHING_GUIDE.md](TTS_CACHING_GUIDE.md) for details.

## 📁 Project Structure

\`\`\`
astro/
├── public/ # Frontend files
│ ├── css/
│ │ └── style.css # Main stylesheet
│ ├── js/
│ │ └── app.js # Frontend JavaScript
│ └── index.html # Main HTML file
├── src/
│ ├── data/
│ │ └── questions.js # Question bank
│ └── services/
│ ├── azureAI.js # Azure OpenAI integration
│ ├── azureSpeech.js # TTS/STT service
│ └── translation.js # Translation service
├── server.js # Express server
├── package.json
├── .env.example # Environment template
├── .gitignore
├── PROJECT_SPECS.md # Detailed specifications
└── README.md
\`\`\`

## 🔧 Configuration

### Azure OpenAI Setup

1. Create an Azure OpenAI resource
2. Deploy a GPT model (GPT-3.5 or GPT-4)
3. Copy the endpoint, API key, and deployment name to \`.env\`

### Azure Speech Services Setup

1. Create a Speech Service resource
2. Copy the API key and region to \`.env\`
3. Supported voices:
   - English: \`en-US-JennyNeural\`
   - Hindi: \`hi-IN-SwaraNeural\`
   - Tamil: \`ta-IN-PallaviNeural\`
   - Telugu: \`te-IN-ShrutiNeural\`
   - Malayalam: \`ml-IN-SobhanaNeural\`

### Azure Translator Setup

1. Create a Translator resource
2. Copy the API key and region to \`.env\`

## 🎮 Usage

1. **Select Language**: Choose from 5 available languages
2. **Start Assessment**: Click to begin the 10-question test
3. **Answer Questions**:
   - Click options to select answers
   - OR use voice input by clicking the microphone button
   - Listen to questions with the speaker button
4. **Get Results**: View your top 3 recommended CSE specializations
5. **Retake**: Start over anytime with the retake button

## 🧪 API Endpoints

### GET /api/questions/:language

Fetch questions in specified language

**Response:**
\`\`\`json
{
"success": true,
"questions": [...]
}
\`\`\`

### POST /api/analyze

Analyze user answers and get recommendations

**Request:**
\`\`\`json
{
"answers": [...],
"language": "en"
}
\`\`\`

**Response:**
\`\`\`json
{
"success": true,
"recommendation": {
"primary": {...},
"secondary": {...},
"tertiary": {...}
}
}
\`\`\`

### POST /api/tts

Convert text to speech

**Request:**
\`\`\`json
{
"text": "Question text",
"language": "en"
}
\`\`\`

### POST /api/stt

Convert speech to text

**Request:**
\`\`\`json
{
"audioData": "base64-encoded-audio",
"language": "en"
}
\`\`\`

## 🔒 Security Notes

- Never commit \`.env\` file to version control
- Keep Azure API keys secure
- Use environment variables for all sensitive data
- Implement rate limiting for production use

## 🐛 Troubleshooting

### Questions not loading

- Check Azure Translator API credentials
- Verify network connectivity

### TTS/STT not working

- Ensure microphone permissions are granted
- Check Azure Speech Service credentials
- Verify region configuration matches your Azure resource

### AI recommendations failing

- Verify Azure OpenAI deployment is active
- Check API quota and limits
- Review console logs for detailed errors

## 📝 Development

### Run in Development Mode

\`\`\`bash
npm run dev
\`\`\`

### Adding New Questions

Edit \`src/data/questions.js\` to add or modify questions in English. Translations will be handled automatically.

### Adding New Languages

1. Add voice mapping in \`src/services/azureSpeech.js\`
2. Add translations in \`public/js/app.js\`
3. Add language option in \`public/index.html\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC License

## 🙏 Acknowledgments

- Azure OpenAI for AI recommendations
- Azure Cognitive Services for Speech and Translation
- All contributors and testers

## 📞 Support

For issues and questions:

- Check PROJECT_SPECS.md for detailed documentation
- Review troubleshooting section
- Check Azure service status

---

**Built with ❤️ for students exploring Computer Science careers**
