# CodedSwitch - AI-Powered Code & Music Platform

CodedSwitch is a revolutionary platform that bridges the gap between programming and music creation through AI-powered tools. The name represents a clever triple entendre: Code Switch (linguistic term), Coded Switch (programming toggle), and Code-Switch (fusion of coding and music).

## 🚀 Features

### Code Translation
- Translate code between 14+ programming languages
- Maintain functionality and logic structure
- AI-powered explanations and optimizations

### Lyric Lab
- Generate creative song lyrics with AI
- Multiple genres and moods support
- Sentiment analysis and rhyme scheme detection

### Beat Studio
- Create professional beats with AI assistance
- Real-time pattern editing and visualization
- Multiple genre templates and customization

### CodeBeat Studio
- Transform code structures into musical compositions
- Convert algorithms into rhythmic patterns
- Revolutionary fusion of programming and music

### AI Assistant
- 24/7 intelligent help for coding and music
- Context-aware suggestions
- Multi-domain expertise

## 🤖 AI Providers

- **xAI Grok** (Default) - Primary AI service with advanced reasoning
- **Google Gemini** - Multimodal AI with enhanced capabilities

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Audio**: Tone.js for music synthesis and playback
- **Deployment**: Render + Neon Database

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/asume21/Replit-Codedswitch-website.git
cd Replit-Codedswitch-website

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys: GEMINI_API_KEY, XAI_API_KEY, DATABASE_URL

# Run development server
npm run dev
```

## 🚀 Deployment

### Render + Neon Database

1. Push to GitHub
2. Connect repository to Render
3. Set environment variables:
   - `DATABASE_URL` (Neon connection string)
   - `GEMINI_API_KEY`
   - `XAI_API_KEY`
4. Deploy using the included `render.yaml`

## 🔧 Environment Variables

```env
DATABASE_URL=postgresql://username:password@hostname/database
GEMINI_API_KEY=your_gemini_api_key
XAI_API_KEY=your_xai_api_key
NODE_ENV=production
# Stripe (Billing)
STRIPE_SECRET_KEY=sk_live_or_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
# Optional: pre-configured subscription prices
STRIPE_PRICE_BASIC=price_...
STRIPE_PRICE_PRO=price_...
```

## 📱 Usage

1. **Code Translation**: Select source/target languages, paste code, and translate
2. **Lyric Generation**: Enter topic, choose genre/mood, generate lyrics
3. **Beat Creation**: Select genre, adjust BPM/duration, generate beats
4. **Code to Music**: Input code, select language, convert to musical composition
5. **AI Assistance**: Ask questions about coding, music theory, or platform usage

### Billing

- Visit `/billing` to view plans and manage your subscription.
- The server exposes:
  - `POST /webhooks/stripe` (raw body) for Stripe webhook events
  - `GET /api/billing/plans` to list available prices
  - `GET /api/billing/status?email=<email>&customerId=<id>` to check status
  - `POST /api/billing/create-checkout-session` for Checkout redirects
  - `POST /api/billing/create-portal-session` for Billing Portal

Webhook setup (local):
- Install Stripe CLI and run: `stripe listen --forward-to localhost:5000/webhooks/stripe`
- Use the printed signing secret as `STRIPE_WEBHOOK_SECRET`.

## 🎵 Audio Features

- Real-time audio synthesis with Tone.js
- Waveform and frequency visualization
- Beat pattern editing and playback
- Musical composition from code structures

## 🔒 Security

- Environment variables for API keys
- Secure database connections
- Input validation and sanitization
- Rate limiting on API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🎯 Future Roadmap

- Additional AI providers integration
- Advanced music theory analysis
- Collaborative features
- Mobile app development
- Enhanced audio effects and synthesis

---

Built with ❤️ using Replit, deployed on Render with Neon Database
=======
# Final-draft-website
>>>>>>> cc2e2068cc06d82ebe5ba61a21c28d62e54bbb9a
