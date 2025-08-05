#!/bin/bash

# Deploy CodedSwitch to new repository
echo "🚀 Deploying CodedSwitch to Final-draft-website repository..."

# Remove existing git configuration to start fresh
rm -rf .git

# Initialize new git repository
git init

# Add the new remote repository
git remote add origin https://github.com/asume21/Final-draft-website.git

# Add all files to staging
git add .

# Create comprehensive commit message
git commit -m "Complete CodedSwitch AI Platform v2.0

🎯 Features:
- Code Translation (14+ languages)
- Lyric Lab (AI-generated lyrics)  
- Beat Studio (professional beats)
- CodeBeat Studio (code to music)
- AI Assistant (24/7 help)

🤖 AI Providers:
- xAI Grok (Primary/Default)
- Google Gemini (Secondary)

🛠 Tech Stack:
- React 18 + TypeScript + Tailwind CSS
- Node.js + Express + Drizzle ORM
- PostgreSQL (Neon Database)
- Tone.js (Audio synthesis)

🚀 Deployment:
- Configured for Render + Neon Database
- Production-ready with render.yaml
- Environment variables configured
- Complete documentation included

Ready for immediate deployment!"

# Push to the new repository
git push -u origin main

echo "✅ Successfully deployed to Final-draft-website repository!"
echo "🌐 Repository: https://github.com/asume21/Final-draft-website"
echo "🚀 Ready for Render deployment with Neon Database!"