// Application State
const state = {
    currentLanguage: 'en',
    currentQuestion: 0,
    questions: [],
    answers: [],
    isRecording: false,
    audioProcessor: null,
    mediaRecorder: null,
    audioChunks: [],
    autoMicEnabled: localStorage.getItem('autoMicEnabled') !== 'false', // Load from localStorage, default true
    isPlayingAudio: false,
    pendingAutoListen: false
};

// Translations for UI elements
const translations = {
    en: {
        welcomeTitle: "Welcome!",
        welcomeText: "This quick assessment will help you discover which Computer Science specialization suits you best based on your interests and personality.",
        instructions: [
            "Answer 10 simple questions",
            "Takes only 3-5 minutes",
            "Use text or voice input",
            "Get personalized recommendations"
        ],
        startAssessment: "Start Assessment",
        changeLanguage: "Change Language",
        speakQuestion: "Read question aloud",
        answerByVoice: "<i class='fa-solid fa-microphone'></i> Answer by Voice",
        previous: "<i class='fa-solid fa-arrow-left'></i> Previous",
        next: "Next <i class='fa-solid fa-arrow-right'></i>",
        analyzing: "Analyzing Your Responses...",
        analyzingSubtext: "Our AI is determining your best fit CSE specializations",
        recommendations: "Your Career Path Recommendations",
        retake: "Retake Assessment",
        share: "Share Results",
        listening: "Listening... Speak now!",
        processing: "Processing your response...",
        primary: "<i class='fa-solid fa-trophy'></i> Best Match",
        secondary: "<i class='fa-solid fa-medal'></i> Second Choice",
        tertiary: "<i class='fa-solid fa-award'></i> Third Choice",
        option: "Option",
        resultSummary: "Based on your assessment, you are fit for"
    },
    hi: {
        welcomeTitle: "स्वागत है!",
        welcomeText: "यह त्वरित मूल्यांकन आपकी रुचियों और व्यक्तित्व के आधार पर यह पता लगाने में मदद करेगा कि कौन सा कंप्यूटर विज्ञान विशेषज्ञता आपके लिए सबसे उपयुक्त है।",
        instructions: [
            "10 सरल प्रश्नों के उत्तर दें",
            "केवल 3-5 मिनट लगते हैं",
            "टेक्स्ट या वॉयस इनपुट का उपयोग करें",
            "व्यक्तिगत सिफारिशें प्राप्त करें"
        ],
        startAssessment: "मूल्यांकन शुरू करें",
        changeLanguage: "भाषा बदलें",
        speakQuestion: "प्रश्न जोर से पढ़ें",
        answerByVoice: "<i class='fa-solid fa-microphone'></i> आवाज से उत्तर दें",
        previous: "<i class='fa-solid fa-arrow-left'></i> पिछला",
        next: "अगला <i class='fa-solid fa-arrow-right'></i>",
        analyzing: "आपकी प्रतिक्रियाओं का विश्लेषण...",
        analyzingSubtext: "हमारा AI आपके लिए सबसे उपयुक्त CSE विशेषज्ञता निर्धारित कर रहा है",
        recommendations: "आपके करियर पथ की सिफारिशें",
        retake: "पुनः मूल्यांकन लें",
        share: "परिणाम साझा करें",
        listening: "सुन रहे हैं... अब बोलें!",
        processing: "आपकी प्रतिक्रिया संसाधित कर रहे हैं...",
        primary: "<i class='fa-solid fa-trophy'></i> सर्वश्रेष्ठ मिलान",
        secondary: "<i class='fa-solid fa-medal'></i> दूसरी पसंद",
        tertiary: "<i class='fa-solid fa-award'></i> तीसरी पसंद",
        option: "विकल्प",
        resultSummary: "आपके मूल्यांकन के आधार पर, आप इसके लिए उपयुक्त हैं"
    }
    // Add more languages as needed
};

// API Helper Functions
async function fetchQuestions(language) {
    try {
        const response = await fetch(`/api/questions/${language}`);
        const data = await response.json();
        if (data.success) {
            return data.questions;
        }
        throw new Error('Failed to fetch questions');
    } catch (error) {
        console.error('Error fetching questions:', error);
        return [];
    }
}

async function analyzeAnswers(answers, language) {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers, language })
        });
        const data = await response.json();
        if (data.success) {
            return data.recommendation;
        }
        throw new Error('Failed to analyze answers');
    } catch (error) {
        console.error('Error analyzing answers:', error);
        return null;
    }
}

async function textToSpeech(text, language, cacheKey = null) {
    try {
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, language, cacheKey })
        });
        const data = await response.json();
        if (data.success) {
            return data.audioData.audio; // Extract audio from the audioData object
        }
        throw new Error('TTS failed');
    } catch (error) {
        console.error('TTS Error:', error);
        return null;
    }
}

// UI Helper Functions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function updateProgressBar() {
    const progress = ((state.currentQuestion + 1) / state.questions.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent =
        `Question ${state.currentQuestion + 1} of ${state.questions.length}`;
}

function getTranslation(key) {
    return translations[state.currentLanguage]?.[key] || translations.en[key];
}

function displayQuestion() {
    const question = state.questions[state.currentQuestion];

    // Add question to chat
    addChatMessage('bot', question.question);

    // Update options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.dataset.index = index;

        // Check if this option was previously selected
        const previousAnswer = state.answers[state.currentQuestion];
        if (previousAnswer && previousAnswer.answerIndex === index) {
            button.classList.add('selected');
        }

        button.addEventListener('click', (e) => selectOption(index, option, e.target));
        optionsContainer.appendChild(button);
    });

    updateProgressBar();

    // Auto-speak the question
    setTimeout(() => speakQuestion(), 500);
}

function addChatMessage(sender, text, isTyping = false) {
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'bot' ? '<i class="fa-solid fa-robot"></i>' : '<i class="fa-solid fa-user"></i>';

    const content = document.createElement('div');
    content.className = 'message-content';

    if (isTyping) {
        content.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
    } else {
        const messageText = document.createElement('p');
        messageText.className = 'message-text';
        messageText.textContent = text;

        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        content.appendChild(messageText);
        content.appendChild(time);
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatContainer.appendChild(messageDiv);

    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return messageDiv;
}

function selectOption(index, text, eventTarget = null) {
    // Stop any playing audio immediately and remove event handlers
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.onended = null; // Remove event handler to prevent auto-mic trigger
    }
    state.isPlayingAudio = false;

    // Update UI
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Add selected class to the target element if provided (from click event)
    // Otherwise, find and select the button at the given index
    if (eventTarget) {
        eventTarget.classList.add('selected');
    } else {
        const optionBtns = document.querySelectorAll('.option-btn');
        if (optionBtns[index]) {
            optionBtns[index].classList.add('selected');
        }
    }

    // Add user's answer to chat
    addChatMessage('user', text);

    // Save answer
    const question = state.questions[state.currentQuestion];
    state.answers[state.currentQuestion] = {
        questionId: question.id,
        question: question.question,
        answer: text,
        answerIndex: index
    };

    // Auto-advance to next question after a short delay
    setTimeout(() => {
        if (state.currentQuestion < state.questions.length - 1) {
            state.currentQuestion++;
            displayQuestion();
        } else {
            analyzeResults();
        }
    }, 1000);
}

async function speakQuestion() {
    const question = state.questions[state.currentQuestion];
    const questionId = question.id;

    // Build combined text with question and all options
    const optionWord = getTranslation('option');
    let questionText = question.question + ". ";
    question.options.forEach((option, index) => {
        questionText += `${optionWord} ${index + 1}: ${option}. `;
    });

    const cacheKey = `question-${questionId}-with-options`;

    state.isPlayingAudio = true;

    // For the new format with options, always generate via API
    // (since cached files only have question without options)
    const audioData = await textToSpeech(questionText, state.currentLanguage, cacheKey);

    if (audioData) {
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = `data:audio/mp3;base64,${audioData}`;

        // Set up event listener for when audio ends
        audioPlayer.onended = () => {
            state.isPlayingAudio = false;
            if (state.autoMicEnabled) {
                setTimeout(() => startVoiceInput(), 500);
            }
        };

        audioPlayer.play();
    } else {
        state.isPlayingAudio = false;
    }
}

async function startVoiceInput() {
    const voiceBtn = document.getElementById('voiceInput');
    const voiceStatus = document.getElementById('voiceStatus');

    if (!state.isRecording) {
        // Start recording with Web Audio API for WAV format
        try {
            state.audioProcessor = new window.AudioProcessor();

            // Set up silence detection callback for auto-stop
            state.audioProcessor.onSilenceDetected = () => {
                console.log('Silence detected, auto-stopping...');
                stopVoiceInput();
            };

            await state.audioProcessor.startRecording();

            state.isRecording = true;
            if (state.autoMicEnabled && !voiceBtn.classList.contains('recording')) {
                voiceBtn.classList.add('auto-listening');
            } else {
                voiceBtn.classList.add('recording');
            }
            voiceBtn.querySelector('.voice-text').textContent = 'Listening...';
            voiceStatus.textContent = getTranslation('listening');

        } catch (error) {
            console.error('Microphone access error:', error);
            voiceStatus.textContent = 'Microphone access denied. Please enable it.';
        }
    } else {
        // Manual stop
        stopVoiceInput();
    }
}

function stopVoiceInput() {
    const voiceBtn = document.getElementById('voiceInput');
    const voiceStatus = document.getElementById('voiceStatus');

    if (!state.isRecording || !state.audioProcessor) return;

    // Stop recording and process
    try {
        state.audioProcessor.stopSilenceDetection();
        const audioBlob = state.audioProcessor.stopRecording();
        const reader = new FileReader();

        voiceStatus.textContent = getTranslation('processing');

        reader.onloadend = async () => {
            const base64Audio = reader.result.split(',')[1];

            try {
                const response = await fetch('/api/stt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        audioData: base64Audio,
                        language: state.currentLanguage
                    })
                });
                const data = await response.json();

                if (data.success && data.text) {
                    const question = state.questions[state.currentQuestion];
                    const matchedIndex = findBestMatch(data.text, question.options);
                    selectOption(matchedIndex, question.options[matchedIndex]);
                    voiceStatus.innerHTML = `<i class="fa-solid fa-check"></i> ${data.text}`;

                    // Clear status after a delay
                    setTimeout(() => {
                        voiceStatus.textContent = '';
                    }, 2000);
                } else {
                    voiceStatus.textContent = 'Speech not recognized. Try again.';
                    setTimeout(() => {
                        voiceStatus.textContent = '';
                    }, 3000);
                }
            } catch (error) {
                console.error('STT Error:', error);
                voiceStatus.textContent = 'Error processing voice.';
                setTimeout(() => {
                    voiceStatus.textContent = '';
                }, 3000);
            }
        };

        reader.readAsDataURL(audioBlob);

    } catch (error) {
        console.error('Recording error:', error);
        voiceStatus.textContent = 'Recording failed.';
        setTimeout(() => {
            voiceStatus.textContent = '';
        }, 3000);
    }

    state.isRecording = false;
    voiceBtn.classList.remove('recording', 'auto-listening');
    voiceBtn.querySelector('.voice-text').textContent = 'Tap to Speak';
}

function toggleAutoMic() {
    state.autoMicEnabled = !state.autoMicEnabled;

    // Save preference to localStorage
    localStorage.setItem('autoMicEnabled', state.autoMicEnabled);

    updateAutoMicUI();
}

function updateAutoMicUI() {
    const toggleBtn = document.getElementById('toggleAutoMic');
    if (!toggleBtn) return;

    if (state.autoMicEnabled) {
        toggleBtn.classList.add('active');
        toggleBtn.innerHTML = '<i class="fa-solid fa-microphone-lines"></i> Auto';
        toggleBtn.title = 'Auto-mic enabled';
    } else {
        toggleBtn.classList.remove('active');
        toggleBtn.innerHTML = '<i class="fa-solid fa-microphone-slash"></i> Manual';
        toggleBtn.title = 'Auto-mic disabled';
    }
}

function findBestMatch(text, options) {
    // Simple keyword matching - can be improved
    const textLower = text.toLowerCase();
    let bestMatch = 0;
    let highestScore = 0;

    options.forEach((option, index) => {
        const optionLower = option.toLowerCase();
        const words = textLower.split(' ');
        let score = 0;

        words.forEach(word => {
            if (optionLower.includes(word)) {
                score++;
            }
        });

        if (score > highestScore) {
            highestScore = score;
            bestMatch = index;
        }
    });

    return bestMatch;
}

async function analyzeResults() {
    // Stop any playing audio
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.onended = null;
    }
    state.isPlayingAudio = false;

    showScreen('loadingScreen');

    const recommendation = await analyzeAnswers(state.answers, state.currentLanguage);

    if (recommendation) {
        displayResults(recommendation);
    } else {
        alert('Error analyzing results. Please try again.');
        showScreen('questionScreen');
    }
}

async function displayResults(recommendation) {
    const resultsContent = document.getElementById('resultsContent');

    const results = [
        { ...recommendation.primary, rank: 'primary', badge: getTranslation('primary') },
        { ...recommendation.secondary, rank: 'secondary', badge: getTranslation('secondary') },
        { ...recommendation.tertiary, rank: 'tertiary', badge: getTranslation('tertiary') }
    ];

    resultsContent.innerHTML = results.map(result => `
        <div class="result-card ${result.rank}">
            <span class="rank-badge ${result.rank}">${result.badge}</span>
            <div class="result-header">
                <h3>${result.stream}</h3>
                <span class="match-percentage">${result.match_percentage}% Match</span>
            </div>
            <ul class="result-reasons">
                ${result.reasons.map(reason => `<li>${reason}</li>`).join('')}
            </ul>
        </div>
    `).join('');

    showScreen('resultsScreen');

    // Speak the result summary immediately with stream-specific cache key
    const summaryText = `${getTranslation('resultSummary')} ${recommendation.primary.stream}`;
    const cacheKey = `result-${recommendation.primary.stream.toLowerCase().replace(/\s+/g, '-')}`;
    const audioData = await textToSpeech(summaryText, state.currentLanguage, cacheKey);

    if (audioData) {
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = `data:audio/mp3;base64,${audioData}`;
        audioPlayer.play();
    }
}

function retakeAssessment() {
    state.currentQuestion = 0;
    state.answers = [];
    showScreen('languageScreen');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize auto-mic UI based on saved preference
    updateAutoMicUI();

    // Language selection - directly start assessment
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            state.currentLanguage = btn.dataset.lang;

            // Fetch questions in selected language
            state.questions = await fetchQuestions(state.currentLanguage);

            // Clear chat and answers
            state.currentQuestion = 0;
            state.answers = [];
            const chatContainer = document.getElementById('chatContainer');
            if (chatContainer) {
                chatContainer.innerHTML = '';
            }

            // Go directly to questions
            showScreen('questionScreen');
            displayQuestion();
        });
    });

    // Change language from chat screen
    const changeLangFromChat = document.getElementById('changeLanguageFromChat');
    if (changeLangFromChat) {
        changeLangFromChat.addEventListener('click', () => {
            if (confirm('Are you sure you want to change language? Your progress will be lost.')) {
                showScreen('languageScreen');
            }
        });
    }

    // Toggle auto-mic
    const toggleAutoMicBtn = document.getElementById('toggleAutoMic');
    if (toggleAutoMicBtn) {
        toggleAutoMicBtn.addEventListener('click', toggleAutoMic);
    }

    // Voice input
    document.getElementById('voiceInput').addEventListener('click', startVoiceInput);

    // Retake assessment
    document.getElementById('retakeAssessment').addEventListener('click', retakeAssessment);

    // Share results (placeholder)
    document.getElementById('shareResults').addEventListener('click', () => {
        alert('Share functionality coming soon!');
    });
});
