# Quick Start Guide - CSE Career Path Predictor

## For Demo/Testing (3 Simple Steps)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Azure Credentials

Edit the `.env` file and add your Azure credentials:

- Azure OpenAI endpoint, key, and deployment name
- Azure Speech key and region
- Azure Translator key and region

See `AZURE_SETUP.md` for detailed instructions on getting these credentials.

### Step 3: Run the Application

```bash
npm start
```

Open your browser and go to: **http://localhost:3000**

---

## Complete Setup Checklist

- [ ] Node.js installed (v14+)
- [ ] Dependencies installed (`npm install`)
- [ ] Azure OpenAI resource created
- [ ] Azure Speech Service created
- [ ] Azure Translator created
- [ ] All credentials added to `.env`
- [ ] Server running (`npm start`)
- [ ] Browser opened to localhost:3000

---

## What to Expect

1. **Language Selection Screen**
   - Choose from: English, Hindi, Tamil, Telugu, Malayalam

2. **Welcome Screen**
   - See instructions in your selected language
   - Click "Start Assessment"

3. **Question Screens (10 questions)**
   - Read questions (or click speaker icon to hear)
   - Select answer by clicking option
   - OR use microphone button for voice input
   - Navigate with Previous/Next buttons

4. **Loading Screen**
   - AI analyzes your responses

5. **Results Screen**
   - See top 3 CSE specialization recommendations
   - View match percentages
   - Read personality-based reasons
   - Option to retake

---

## Features to Test

### ✅ Basic Features

- [ ] Language selection works
- [ ] Questions display correctly
- [ ] Can select answers
- [ ] Navigation works (Previous/Next)
- [ ] Progress bar updates
- [ ] Results display

### ✅ Advanced Features

- [ ] Text-to-Speech (speaker icon)
- [ ] Speech-to-Text (microphone button)
- [ ] Multilingual question translation
- [ ] AI recommendations

---

## Troubleshooting Quick Fixes

### Server won't start

```bash
# Check if port 3000 is in use
npm start
# If port conflict, edit .env and change PORT=3000 to PORT=3001
```

### Questions not loading

- Check Azure Translator credentials in `.env`
- Verify internet connection
- Check browser console for errors (F12)

### TTS not working

- Check browser microphone/speaker permissions
- Verify Azure Speech credentials
- Try a different browser (Chrome recommended)

### AI recommendations failing

- Verify Azure OpenAI deployment is active
- Check if you have quota remaining
- Review server console logs

---

## File Structure Overview

```
astro/
├── public/              ← Frontend files (HTML, CSS, JS)
├── src/
│   ├── data/           ← Question bank
│   └── services/       ← Azure API integrations
├── server.js           ← Main server file
├── .env                ← YOUR CREDENTIALS (don't commit!)
└── package.json        ← Dependencies
```

---

## Next Steps After Basic Setup

1. **Customize Questions**: Edit `src/data/questions.js`
2. **Adjust Styling**: Modify `public/css/style.css`
3. **Add More Streams**: Update `src/services/azureAI.js`
4. **Deploy**: Consider Azure App Service or similar

---

## Support Resources

- 📖 Detailed specs: `PROJECT_SPECS.md`
- 🔧 Azure setup: `AZURE_SETUP.md`
- 📝 Full docs: `README.md`

---

**Ready to help students discover their perfect CSE career path! 🎓🚀**
