# Audio Cache Directory

This directory contains cached TTS (Text-to-Speech) audio files for all questions in all supported languages.

## Structure

```
audio/
├── en/          # English audio files
├── hi/          # Hindi audio files
├── ta/          # Tamil audio files
├── te/          # Telugu audio files
└── ml/          # Malayalam audio files
```

## How It Works

1. **First Time Setup**: Run `npm run generate-cache` to pre-generate all audio files
2. **Automatic Caching**: The app will automatically use these cached files instead of calling Azure TTS API
3. **Fallback**: If a cached file is missing, the app will generate it on-the-fly and cache it

## Benefits

- ✅ **99% Cost Savings**: Only generate each audio file once
- ✅ **Instant Playback**: No API delay
- ✅ **Offline Support**: Questions work even without internet (for TTS)
- ✅ **Unlimited Students**: Serve unlimited users without quota concerns

## File Naming

Files are named as: `question-{id}.mp3`

Example:

- `question-1.mp3` = Audio for question 1
- `question-2.mp3` = Audio for question 2
- etc.

## Size

Each file: ~30-50 KB
Total for all languages: ~2.5 MB

## Regeneration

To regenerate all audio files:

```bash
npm run generate-cache
```

Or for a specific language via API:

```bash
POST /api/cache/generate
{
  "language": "en"
}
```

---

**Note**: This directory is already configured in `.gitignore` to avoid committing large audio files to version control. You should generate the cache on your server after deployment.
