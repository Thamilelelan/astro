# Testing & Demo Checklist

## Pre-Demo Setup

### Environment Check

- [ ] `.env` file configured with all Azure credentials
- [ ] Server starts without errors (`npm start`)
- [ ] Browser can access http://localhost:3000
- [ ] Internet connection stable (for Azure APIs)

### Azure Services Status

- [ ] Azure OpenAI deployment is active
- [ ] Azure Speech Service is provisioned
- [ ] Azure Translator is active
- [ ] All services have available quota

### Browser Setup

- [ ] Using Chrome, Edge, or Firefox (recommended)
- [ ] Microphone permission granted
- [ ] Speaker/audio output working
- [ ] JavaScript enabled

---

## Feature Testing Workflow

### 1. Language Selection (2 min)

- [ ] All 5 language buttons display correctly
- [ ] English works
- [ ] Hindi works
- [ ] Tamil works
- [ ] Telugu works
- [ ] Malayalam works
- [ ] Clicking a language proceeds to welcome screen

### 2. Welcome Screen (1 min)

- [ ] Welcome text displays in selected language
- [ ] Instructions list shows correctly
- [ ] "Start Assessment" button works
- [ ] "Change Language" returns to language selection

### 3. Question Flow (3-5 min)

- [ ] Question 1 displays correctly
- [ ] All 4 options are visible and clickable
- [ ] Selecting an option highlights it
- [ ] "Next" button enables after selection
- [ ] Progress bar updates (shows 1/10, 2/10, etc.)
- [ ] Can navigate to next question
- [ ] "Previous" button works (disabled on Q1)
- [ ] Progress persists when going back
- [ ] All 10 questions accessible

### 4. Text-to-Speech (30 sec per test)

- [ ] Speaker icon visible on each question
- [ ] Clicking speaker plays audio
- [ ] Audio is in correct language
- [ ] Voice is clear and natural
- [ ] Can stop/replay audio

### 5. Speech-to-Text (1 min per test)

- [ ] Microphone button visible
- [ ] Clicking mic requests permission
- [ ] Recording indicator shows (red button)
- [ ] Speaking recognizes words
- [ ] Stops recording when clicked again
- [ ] Matches closest option automatically
- [ ] Voice status shows feedback

### 6. Results Screen (2 min)

- [ ] Loading screen appears after Q10
- [ ] Spinner animation works
- [ ] Results load within 5-10 seconds
- [ ] Shows 3 recommendations:
  - [ ] Primary (highest match %)
  - [ ] Secondary (medium match %)
  - [ ] Tertiary (lower match %)
- [ ] Each result shows:
  - [ ] Stream name
  - [ ] Match percentage
  - [ ] Reasons list
  - [ ] Proper formatting
- [ ] "Retake Assessment" button works
- [ ] Returns to welcome screen on retake

---

## Common Test Scenarios

### Scenario 1: Security-Focused Student

**Answers to select**: Choose options mentioning:

- Security, protection, ethical hacking
- Analytical tasks
- Safety and privacy

**Expected Result**: Cyber Security as primary or secondary recommendation

### Scenario 2: Creative/Design-Oriented Student

**Answers to select**: Choose options mentioning:

- Visual design, UI/UX
- Building apps and websites
- User experience
- Creative projects

**Expected Result**: Full Stack Development or Mobile Development

### Scenario 3: Math/Data-Driven Student

**Answers to select**: Choose options mentioning:

- Mathematics, statistics
- Data analysis, patterns
- AI/ML, predictions
- Research

**Expected Result**: AI/ML or Data Science

### Scenario 4: Hardware Enthusiast

**Answers to select**: Choose options mentioning:

- Hardware, devices, sensors
- IoT, connectivity
- Physical systems
- Practical applications

**Expected Result**: IoT or Computer Networks

---

## Error Handling Tests

### Network Issues

- [ ] Graceful fallback if OpenAI fails (uses rule-based)
- [ ] Error message if questions won't load
- [ ] Retry mechanism for TTS/STT failures

### User Input Issues

- [ ] Can't proceed without selecting answer
- [ ] Voice input handles unclear speech
- [ ] Works with no microphone (text-only mode)

### Edge Cases

- [ ] Rapid clicking doesn't break navigation
- [ ] Refreshing page resets session
- [ ] Multiple tabs work independently
- [ ] Back button handling

---

## Performance Benchmarks

### Load Times

- [ ] Initial page load: < 2 seconds
- [ ] Language switch: < 1 second
- [ ] Question load: < 500ms
- [ ] TTS generation: < 3 seconds
- [ ] STT recognition: < 5 seconds
- [ ] AI analysis: < 10 seconds
- [ ] Results display: < 1 second

### Resource Usage

- [ ] Browser memory reasonable
- [ ] No console errors
- [ ] Network requests complete
- [ ] No memory leaks on retake

---

## Accessibility Check

### Visual

- [ ] Text is readable (good contrast)
- [ ] Buttons are clearly labeled
- [ ] Progress is visible
- [ ] Colors distinguish states

### Audio

- [ ] TTS volume adequate
- [ ] Speech is clear
- [ ] Can mute if needed

### Interaction

- [ ] Large click targets (mobile-friendly)
- [ ] Keyboard navigation possible
- [ ] Clear feedback on actions

---

## Multi-Language Verification

For each language, verify:

- [ ] Questions translated correctly
- [ ] No truncation or overflow
- [ ] Cultural appropriateness
- [ ] Technical terms accurate
- [ ] TTS pronunciation correct

---

## Demo Presentation Tips

### 1. Start Clean

- Clear browser cache
- Fresh server start
- Check all services

### 2. Follow This Flow

1. Show language selection (1 min)
2. Demonstrate English flow (2 min)
3. Show TTS feature (30 sec)
4. Demo STT with 1-2 questions (1 min)
5. Complete assessment (1 min)
6. Show results (1 min)
7. Switch language and show translation (1 min)

### 3. Have Backup Ready

- Pre-recorded demo video
- Screenshots of key features
- Fallback to rule-based if OpenAI fails

### 4. Answer Common Questions

- "How accurate are recommendations?"
- "What data is stored?"
- "Can we add more questions?"
- "How much does Azure cost?"

---

## Known Limitations

- [ ] Session-based (no persistence)
- [ ] Requires internet for Azure APIs
- [ ] Voice input quality varies by microphone
- [ ] Translation accuracy depends on Azure
- [ ] Free tier has monthly quotas

---

## Post-Demo Checklist

- [ ] Gather feedback
- [ ] Note any bugs encountered
- [ ] Document improvement ideas
- [ ] Check Azure usage/costs
- [ ] Thank participants

---

## Emergency Troubleshooting

### If demo fails:

1. **Check console**: F12 in browser
2. **Check server logs**: Terminal output
3. **Verify .env**: Credentials correct?
4. **Test Azure Portal**: Services active?
5. **Fallback**: Use English + text-only mode

### Quick fixes:

- Restart server: Ctrl+C, then `npm start`
- Clear cache: Ctrl+Shift+Delete
- Try incognito: New incognito window
- Check network: Ping test

---

**Good luck with your demo! 🎉**
