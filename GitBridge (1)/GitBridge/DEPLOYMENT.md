# CodedSwitch Deployment Guide

## Repository: https://github.com/asume21/Final-draft-website

## Quick Deployment Steps

### 1. Push to New Repository
```bash
# Run the deployment script
./deploy-to-new-repo.sh
```

### 2. Deploy on Render

1. **Connect Repository**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect: `https://github.com/asume21/Final-draft-website`

2. **Environment Variables** (Required):
   ```
   DATABASE_URL=your_neon_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   XAI_API_KEY=your_xai_grok_api_key
   NODE_ENV=production
   ```

3. **Automatic Configuration**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Auto-detected from `render.yaml`

### 3. Database Setup (Neon)

The app is pre-configured for Neon Database:
- Connection pooling with `@neondatabase/serverless`
- WebSocket support for serverless environments
- Drizzle ORM with PostgreSQL dialect

### 4. Post-Deployment

After successful deployment:
```bash
# Push database schema (if needed)
npm run db:push
```

## Features Ready for Production

✅ **Code Translation**: 14+ programming languages  
✅ **Lyric Lab**: AI-powered song lyrics generation  
✅ **Beat Studio**: Professional beat creation  
✅ **CodeBeat Studio**: Code-to-music conversion  
✅ **AI Assistant**: 24/7 intelligent help  

## AI Providers Configured

- **xAI Grok** (Primary/Default)
- **Google Gemini** (Secondary)

Both providers available in all components with user selection.

## Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Audio**: Tone.js for synthesis and playback
- **Deployment**: Render + Neon Database

## Support

All components include proper error handling, loading states, and user feedback. The platform is production-ready with comprehensive documentation.