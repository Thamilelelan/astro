# Deployment Guide

## Option 1: Azure App Service (Recommended)

### Prerequisites

- Azure account
- Azure CLI installed

### Steps

1. **Login to Azure**

```bash
az login
```

2. **Create Resource Group**

```bash
az group create --name cse-career-rg --location eastus
```

3. **Create App Service Plan**

```bash
az appservice plan create --name cse-career-plan --resource-group cse-career-rg --sku F1 --is-linux
```

4. **Create Web App**

```bash
az webapp create --resource-group cse-career-rg --plan cse-career-plan --name cse-career-predictor --runtime "NODE|18-lts"
```

5. **Configure Environment Variables**

```bash
az webapp config appsettings set --resource-group cse-career-rg --name cse-career-predictor --settings \
  AZURE_OPENAI_ENDPOINT="your-endpoint" \
  AZURE_OPENAI_API_KEY="your-key" \
  AZURE_OPENAI_DEPLOYMENT_NAME="your-deployment" \
  AZURE_SPEECH_KEY="your-key" \
  AZURE_SPEECH_REGION="your-region" \
  AZURE_TRANSLATOR_KEY="your-key" \
  AZURE_TRANSLATOR_REGION="your-region" \
  NODE_ENV="production"
```

6. **Deploy Code**

```bash
# Initialize git if not already
git init
git add .
git commit -m "Initial commit"

# Deploy
az webapp deployment source config-local-git --name cse-career-predictor --resource-group cse-career-rg
git remote add azure <URL_FROM_ABOVE_COMMAND>
git push azure main
```

7. **Access Your App**

```
https://cse-career-predictor.azurewebsites.net
```

---

## Option 2: Heroku

### Prerequisites

- Heroku account
- Heroku CLI installed

### Steps

1. **Login**

```bash
heroku login
```

2. **Create App**

```bash
heroku create cse-career-predictor
```

3. **Set Environment Variables**

```bash
heroku config:set AZURE_OPENAI_ENDPOINT=your-endpoint
heroku config:set AZURE_OPENAI_API_KEY=your-key
heroku config:set AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment
heroku config:set AZURE_SPEECH_KEY=your-key
heroku config:set AZURE_SPEECH_REGION=your-region
heroku config:set AZURE_TRANSLATOR_KEY=your-key
heroku config:set AZURE_TRANSLATOR_REGION=your-region
```

4. **Deploy**

```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

5. **Open App**

```bash
heroku open
```

---

## Option 3: Vercel (Serverless)

### Note

Requires converting to serverless functions. Not ideal for this application.

---

## Option 4: Local Network (For Stall Demo)

### Best for Exhibition/Stall Setup

1. **Setup Computer**
   - Install Node.js
   - Clone/copy project
   - Configure .env
   - Run `npm install`

2. **Find Local IP**

```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

3. **Update Server**
   Edit `server.js` to listen on all interfaces:

```javascript
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
```

4. **Start Server**

```bash
npm start
```

5. **Share with Others**
   Students can access via:

```
http://YOUR_LOCAL_IP:3000
```

Example: `http://192.168.1.100:3000`

6. **Firewall Configuration**

- Allow port 3000 in Windows Firewall
- Ensure all devices on same WiFi network

---

## Production Checklist

### Before Deployment

- [ ] All features tested
- [ ] Azure services configured
- [ ] Environment variables set
- [ ] .env excluded from Git
- [ ] Error handling robust
- [ ] Loading states implemented
- [ ] CORS configured properly
- [ ] Rate limiting considered

### Security

- [ ] API keys secured
- [ ] No sensitive data in code
- [ ] HTTPS enabled
- [ ] Input validation
- [ ] SQL injection protected (N/A - no DB)
- [ ] XSS protection

### Performance

- [ ] Questions cached
- [ ] Compression enabled
- [ ] Static assets optimized
- [ ] CDN considered (optional)

### Monitoring

- [ ] Azure monitoring enabled
- [ ] Error logging configured
- [ ] Usage analytics (optional)
- [ ] Quota alerts set

---

## Environment-Specific Configurations

### Development

```env
NODE_ENV=development
PORT=3000
```

### Production

```env
NODE_ENV=production
PORT=80 or 443
```

---

## Post-Deployment Testing

1. **Smoke Test**
   - [ ] Homepage loads
   - [ ] Language selection works
   - [ ] Questions display
   - [ ] Results show

2. **Feature Test**
   - [ ] TTS works
   - [ ] STT works
   - [ ] All languages work
   - [ ] AI recommendations work

3. **Load Test**
   - [ ] Handle 10 concurrent users
   - [ ] Response times acceptable
   - [ ] No memory leaks

---

## Monitoring & Maintenance

### Azure Portal

- Check quota usage
- Monitor API calls
- Set up alerts
- Review logs

### Application Insights (Optional)

```bash
npm install applicationinsights
```

Add to `server.js`:

```javascript
const appInsights = require("applicationinsights");
appInsights.setup("YOUR_INSTRUMENTATION_KEY").start();
```

---

## Rollback Plan

If deployment fails:

1. **Azure App Service**

```bash
az webapp deployment list-publishing-profiles --name cse-career-predictor --resource-group cse-career-rg
# Redeploy previous version
```

2. **Heroku**

```bash
heroku releases
heroku rollback v<VERSION_NUMBER>
```

3. **Local**

```bash
git checkout <PREVIOUS_COMMIT>
npm start
```

---

## Cost Optimization

### Free Tier Limits

- Use F1 tier for App Service (free)
- Stay within Azure free credits
- Monitor usage weekly

### Scaling

- Start with F1 (free)
- Upgrade to B1 if needed (~$13/month)
- Consider serverless for variable traffic

---

## Custom Domain (Optional)

### Azure App Service

1. **Buy domain** (e.g., GoDaddy, Namecheap)

2. **Configure DNS**

```
CNAME: www -> cse-career-predictor.azurewebsites.net
```

3. **Add to Azure**

```bash
az webapp config hostname add --webapp-name cse-career-predictor --resource-group cse-career-rg --hostname www.yourdomain.com
```

4. **Enable HTTPS**

```bash
az webapp update --name cse-career-predictor --resource-group cse-career-rg --https-only true
```

---

## Backup & Recovery

### Code Backup

- Push to GitHub/GitLab
- Regular commits
- Tag releases

### Configuration Backup

- Save .env.example
- Document Azure setup
- Screenshot Azure configs

---

## Troubleshooting Deployment

### "Application Error"

- Check logs: `heroku logs --tail` or Azure portal
- Verify environment variables
- Check Node version

### "Cannot GET /"

- Verify static file serving
- Check public folder path
- Review server.js routes

### "API Errors"

- Verify Azure credentials in production
- Check CORS settings
- Review API quotas

---

## Support & Updates

### Regular Maintenance

- Update dependencies monthly: `npm update`
- Check security: `npm audit fix`
- Review Azure costs weekly
- Monitor user feedback

### Version Updates

1. Test locally
2. Create git tag
3. Deploy to staging (optional)
4. Deploy to production
5. Monitor for issues

---

**Deployment complete! Your app is now live! 🚀**
