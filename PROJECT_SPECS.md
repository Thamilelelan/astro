# CSE Career Path Predictor - Project Specifications

## Overview

AI-powered career guidance bot for 11th/12th standard students to predict suitable CSE specialization streams.

## Core Features

- **10 Questions Assessment**: Quick 3-5 minute assessment
- **Multilingual Support**: English, Tamil, Telugu, Malayalam, Hindi
- **Text-to-Speech (TTS)**: Questions read aloud in selected language
- **Speech-to-Text (STT)**: Voice-based answers
- **AI Recommendations**: Psychology-based stream prediction with reasoning

## CSE Streams Covered

1. Cyber Security
2. Artificial Intelligence & Machine Learning
3. Full Stack Development
4. Data Science
5. Cloud Computing
6. DevOps
7. Game Development
8. IoT (Internet of Things)
9. Blockchain
10. Mobile App Development
11. Computer Networks

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI Services**: Azure OpenAI API (GPT models)
- **Speech Services**: Azure Cognitive Services Speech
- **Translation**: Azure Translator API

## Architecture

- Session-based (no user accounts/database)
- Node server serves static frontend files
- REST API endpoints for Azure service integration
- Single-page application flow

## Budget Constraints

- Use ONLY Azure free credits
- No paid API calls outside of Azure credits
- Avoid services that charge credit cards directly

## User Flow

1. Select language
2. Start assessment
3. Answer 10 questions (text or voice)
4. Get AI-powered recommendation
5. View suitable streams with reasoning
6. Option to retake (new session)

## Development Priority

1. Project setup & structure
2. Basic UI/UX with language selection
3. Question bank (10 questions)
4. Azure API integration (OpenAI, Speech, Translator)
5. Recommendation engine
6. TTS/STT features
7. Testing & refinement
