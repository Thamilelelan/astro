# Azure Setup Guide

This guide will help you configure all necessary Azure services for the CSE Career Path Predictor application.

## Prerequisites

- Active Azure account with free credits
- Azure subscription

## Step 1: Azure OpenAI Service

### Create Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Azure OpenAI"
4. Click "Create"

### Configure

- **Subscription**: Select your subscription
- **Resource Group**: Create new or select existing
- **Region**: Choose a supported region (e.g., East US, West Europe)
- **Name**: Give it a unique name (e.g., `cse-career-openai`)
- **Pricing Tier**: Standard

### Deploy Model

1. Once created, go to your Azure OpenAI resource
2. Click "Model deployments" or go to Azure OpenAI Studio
3. Click "Create new deployment"
4. Select model: **gpt-35-turbo** or **gpt-4** (if available)
5. Give deployment a name (e.g., `career-predictor`)
6. Click "Create"

### Get Credentials

1. Go to "Keys and Endpoint" in your resource
2. Copy:
   - **Endpoint**: (e.g., `https://your-resource.openai.azure.com/`)
   - **Key 1**: Your API key
   - **Deployment Name**: The name you gave your model deployment

Add to `.env`:

```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=career-predictor
```

## Step 2: Azure Speech Services

### Create Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Speech"
4. Select "Speech" service
5. Click "Create"

### Configure

- **Subscription**: Select your subscription
- **Resource Group**: Use same as OpenAI or create new
- **Region**: Choose a region (e.g., East US)
- **Name**: Give it a unique name (e.g., `cse-career-speech`)
- **Pricing Tier**: **Free (F0)** (includes 5M chars for TTS, 5 hours for STT per month)

### Get Credentials

1. Once created, go to "Keys and Endpoint"
2. Copy:
   - **Key 1**: Your API key
   - **Location/Region**: Your region code (e.g., `eastus`)

Add to `.env`:

```env
AZURE_SPEECH_KEY=your-speech-key-here
AZURE_SPEECH_REGION=eastus
```

## Step 3: Azure Translator

### Create Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Translator"
4. Select "Translator"
5. Click "Create"

### Configure

- **Subscription**: Select your subscription
- **Resource Group**: Use same as previous services
- **Region**: Choose a region (or Global for multi-region)
- **Name**: Give it a unique name (e.g., `cse-career-translator`)
- **Pricing Tier**: **Free (F0)** (2M chars per month)

### Get Credentials

1. Once created, go to "Keys and Endpoint"
2. Copy:
   - **Key 1**: Your API key
   - **Location/Region**: Your region code
   - **Endpoint**: Should be `https://api.cognitive.microsofttranslator.com/`

Add to `.env`:

```env
AZURE_TRANSLATOR_KEY=your-translator-key-here
AZURE_TRANSLATOR_REGION=eastus
AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com/
```

## Step 4: Verify Setup

### Complete .env File

Your final `.env` file should look like this:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=abc123...
AZURE_OPENAI_DEPLOYMENT_NAME=career-predictor

# Azure Speech Services Configuration
AZURE_SPEECH_KEY=def456...
AZURE_SPEECH_REGION=eastus

# Azure Translator Configuration
AZURE_TRANSLATOR_KEY=ghi789...
AZURE_TRANSLATOR_REGION=eastus
AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com/

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Test Connection

Run the application:

```bash
npm start
```

Check console for any errors. If everything is configured correctly, you should see:

```
🚀 CSE Career Path Predictor Server Running!
📍 Server: http://localhost:3000
📊 Environment: development
```

## Free Tier Limits

### Azure OpenAI

- Pay-as-you-go with credits
- Monitor usage in Azure Portal

### Azure Speech (Free F0)

- **Text-to-Speech**: 5 million characters per month
- **Speech-to-Text**: 5 audio hours per month
- **Neural voices**: Included

### Azure Translator (Free F0)

- **2 million characters** per month
- All language pairs included

## Cost Management Tips

1. **Monitor Usage**: Check Azure Portal regularly
2. **Set Alerts**: Configure budget alerts in Azure
3. **Use Free Tiers**: Start with F0 tiers where available
4. **Cache Translations**: The app caches translated questions
5. **Limit Concurrent Users**: For demo purposes

## Troubleshooting

### "Unauthorized" errors

- Verify API keys are correct
- Check that keys haven't expired
- Ensure resource is in active state

### "Region not supported" errors

- Verify region codes match (e.g., `eastus`, not `East US`)
- Some services have limited region availability

### "Quota exceeded" errors

- Check your usage in Azure Portal
- Upgrade to paid tier if needed
- Wait for quota reset (monthly)

### CORS errors

- The app has CORS enabled in server.js
- Ensure you're accessing via localhost or configured domain

## Security Best Practices

1. **Never commit .env file** to Git
2. **Rotate keys regularly**
3. **Use separate resources** for development and production
4. **Enable logging** in Azure Portal
5. **Set up resource locks** to prevent accidental deletion
6. **Configure IP restrictions** for production

## Additional Resources

- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/cognitive-services/openai/)
- [Azure Speech Documentation](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/)
- [Azure Translator Documentation](https://learn.microsoft.com/en-us/azure/cognitive-services/translator/)

---

**Need help?** Check Azure status page or contact Azure support.
