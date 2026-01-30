# TTS Caching Guide

## 🎯 Overview

The TTS (Text-to-Speech) caching system dramatically reduces Azure costs by pre-generating and storing audio files for all questions. Instead of calling the Azure TTS API every time a student hears a question, the app serves pre-generated audio files.

## 💰 Cost Savings

### Without Caching:

- 100 students × 10 questions × 5 languages = **5,000 TTS API calls**
- Cost: ~**500,000 characters** from your quota

### With Caching:

- 10 questions × 5 languages = **50 TTS API calls** (one-time)
- Cost: ~**5,000 characters** (99% savings!)
- All subsequent students: **0 API calls** ✅

## 🚀 How to Use

### Method 1: Generate All Cache at Once (Recommended)

After configuring Azure Speech credentials in `.env`, run:

```bash
npm run generate-cache
```

This will:

1. Generate audio for all 10 questions
2. In all 5 languages (English, Hindi, Tamil, Telugu, Malayalam)
3. Save them to `public/audio/` directory
4. Take about 2-3 minutes to complete

### Method 2: Generate Via API Endpoint

Start your server and call the cache generation endpoint:

```bash
# Generate cache for all languages
curl -X POST http://localhost:3000/api/cache/generate-all

# Or generate for specific language
curl -X POST http://localhost:3000/api/cache/generate \
  -H "Content-Type: application/json" \
  -d '{"language": "en"}'
```

### Method 3: Automatic On-Demand Caching

If you don't pre-generate the cache:

- The first student to hear a question will trigger TTS generation
- The audio is automatically cached for future students
- Subsequent students get instant cached audio

## 📁 File Structure

After generation, your directory will look like:

```
public/audio/
├── en/
│   ├── question-1.mp3
│   ├── question-2.mp3
│   ├── ...
│   └── question-10.mp3
├── hi/
│   ├── question-1.mp3
│   └── ...
├── ta/
├── te/
└── ml/
```

**Total storage**: ~2.5 MB for all files

## 🔄 How It Works

### 1. Frontend Request

When a student clicks the speaker icon:

```javascript
// Frontend checks for cached file first
const cachedPath = `/audio/en/question-1.mp3`;
const response = await fetch(cachedPath, { method: "HEAD" });

if (response.ok) {
  // Use cached file (instant!)
  audioPlayer.src = cachedPath;
} else {
  // Fallback to API
  const audio = await textToSpeech(questionText, "en", "question-1");
}
```

### 2. Backend Caching

When TTS is called with a `cacheKey`:

```javascript
// Generate audio via Azure
const audioData = await synthesize(text);

// Save to file system
fs.writeFileSync("public/audio/en/question-1.mp3", audioData);

// Return base64 for immediate playback
return base64Audio;
```

### 3. Subsequent Requests

- Check if file exists: `public/audio/en/question-1.mp3`
- If yes → serve cached file (no API call!)
- If no → generate and cache (first-time only)

## 🛠️ Technical Details

### Cache Key Format

```
question-{questionId}
```

Examples:

- Question 1: `question-1`
- Question 2: `question-2`

### Audio Format

- **Format**: MP3
- **Bitrate**: 32 Kbps
- **Sample Rate**: 16 kHz
- **Quality**: Optimized for speech
- **Size**: ~30-50 KB per file

### API Endpoints

#### Generate Cache for One Language

```
POST /api/cache/generate
Body: { "language": "en" }
```

#### Generate Cache for All Languages

```
POST /api/cache/generate-all
```

#### Regular TTS (with optional caching)

```
POST /api/tts
Body: {
  "text": "Question text",
  "language": "en",
  "cacheKey": "question-1"  // Optional
}
```

## 📊 Monitoring Cache Status

Check which files are cached:

```bash
# Windows
dir "public\audio\en"

# Mac/Linux
ls -lh public/audio/en/
```

Expected output after full cache generation:

```
question-1.mp3    45 KB
question-2.mp3    42 KB
question-3.mp3    48 KB
...
question-10.mp3   43 KB
```

## 🔧 Troubleshooting

### Cache Generation Fails

**Problem**: `npm run generate-cache` shows errors

**Solutions**:

1. Check Azure Speech credentials in `.env`
2. Verify internet connection
3. Check Azure quota (Free tier: 5M chars/month)
4. Look for specific error messages in console

### Audio Files Not Playing

**Problem**: Cached files exist but don't play

**Solutions**:

1. Check file permissions
2. Verify MP3 format (should be valid audio)
3. Test in different browser
4. Check browser console for errors

### Cache Not Being Used

**Problem**: API still being called despite cached files

**Solutions**:

1. Check file naming: must be `question-{id}.mp3`
2. Verify files are in correct language folder
3. Check server logs for cache hit/miss
4. Clear browser cache and reload

## 🎯 Best Practices

### 1. Pre-Generate Before Demo

```bash
# Always generate cache before your stall demo
npm run generate-cache
```

### 2. Verify Cache is Complete

```bash
# Should see 10 files per language (50 total)
# Windows
dir /s "public\audio\*.mp3" | find /c ".mp3"

# Mac/Linux
find public/audio -name "*.mp3" | wc -l
```

Should output: **50** (10 questions × 5 languages)

### 3. Include in Deployment

When deploying, run cache generation on the server:

```bash
npm install
npm run generate-cache
npm start
```

### 4. Backup Cache Files

Consider backing up generated audio files:

```bash
# Compress audio folder
tar -czf audio-cache-backup.tar.gz public/audio/
```

## 🚫 What NOT to Cache

**Don't cache**:

- ❌ Student voice responses (STT) - each is unique
- ❌ Dynamic result text - varies per student
- ❌ Custom messages - not questions

**Only cache**:

- ✅ Question text (same for all students)
- ✅ Static UI messages (if any)

## 📈 Performance Impact

### Before Caching:

- TTS API call: ~2-3 seconds
- Network latency: ~500ms
- **Total**: ~3 seconds per question

### After Caching:

- File retrieval: ~50ms
- No network call needed
- **Total**: ~50ms per question (60x faster!)

## 🔐 Security Considerations

1. **Audio files are public**: Anyone can access cached audio
   - This is fine for educational content
   - No sensitive data in questions

2. **No authentication needed**: Static file serving
   - Reduces server load
   - Improves performance

3. **Version control**: Audio files excluded from Git
   - Keeps repository size small
   - Generate locally as needed

## 🎓 For Development

### Testing Cache Generation

```bash
# Generate only English (for testing)
curl -X POST http://localhost:3000/api/cache/generate \
  -H "Content-Type: application/json" \
  -d '{"language": "en"}'
```

### Clear Cache (for testing)

```bash
# Delete all cached audio
rm -rf public/audio/*/*.mp3
```

### Monitor Cache Usage

Check server logs for:

```
Using cached audio for en/question-1
```

vs

```
Cached audio: en/question-1.mp3
```

First = cache hit, Second = cache generation

---

## ✅ Quick Checklist

Before your demo:

- [ ] Azure Speech credentials configured in `.env`
- [ ] Ran `npm run generate-cache`
- [ ] Verified 50 MP3 files created
- [ ] Tested audio playback in app
- [ ] Checked server logs show "Using cached audio"

---

**With TTS caching, your Free tier Azure Speech quota will easily handle hundreds of students! 🎉**
