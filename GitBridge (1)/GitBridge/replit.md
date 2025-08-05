# Overview

CodedSwitch is a creative platform that bridges the gap between programming and music creation through AI-powered tools. The application combines code translation capabilities with music generation features, allowing users to translate code between programming languages, generate lyrics and beats, and even convert code structures into musical patterns. Built as a full-stack web application, it features a modern React frontend with a Node.js/Express backend, utilizing Google Gemini and xAI Grok AI services for intelligent code and music generation.

## Recent Changes (January 2025)
- **Removed OpenAI completely** from the entire platform
- **Added xAI Grok integration** as the primary AI provider
- **Set Grok as default** across all platform features
- **Added AI provider selectors** to all components (Lyric Lab, Beat Studio, CodeBeat Studio, AI Assistant)
- **Configured for Render deployment** with Neon Database integration
- **Updated all API endpoints** to support only Gemini and Grok providers

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client uses React with TypeScript in a single-page application structure. The UI is built with shadcn/ui components for consistent design and Radix UI primitives for accessibility. Styling is handled through Tailwind CSS with a custom dark theme optimized for coding environments. The application uses Wouter for lightweight client-side routing and TanStack Query for server state management and API caching.

## Backend Architecture
The server follows a REST API pattern built with Express.js and TypeScript. Routes are modularized through a registration system that handles different feature areas (code translation, music generation, user management). The application uses a middleware-based approach for request logging, error handling, and JSON processing. Development includes Vite integration for hot module replacement and development tooling.

## Data Storage Solutions
The application implements a dual storage approach. For development and testing, it uses an in-memory storage system with Map-based data structures. For production, it's configured to use PostgreSQL through Drizzle ORM with Neon Database as the serverless database provider. The schema includes tables for users, projects, code translations, and music generations with proper foreign key relationships.

## Authentication and Authorization
The current implementation uses a basic storage pattern without explicit authentication middleware. The system tracks users through ID-based associations but doesn't implement session management or access control at the API level. User identification is handled through optional userId parameters in API requests.

## External Dependencies

### AI Services
- **xAI Grok**: Primary AI service for code translation, lyric generation, music analysis, and intelligent assistance (default provider)
- **Google Gemini**: Secondary AI service with multimodal capabilities for enhanced code and music generation
- **Code Translation**: Converts code between programming languages while maintaining functionality
- **Music Generation**: Creates lyrics with mood/genre specifications and generates beat patterns
- **AI Assistant**: Provides coding help and music theory guidance
- **Provider Selection**: Users can choose between Grok and Gemini for each feature independently

### Database and Storage
- **Neon Database**: Serverless PostgreSQL database for production data storage
- **Drizzle ORM**: Type-safe database ORM with schema management and migrations
- **connect-pg-simple**: PostgreSQL session store for potential future session management

### Audio and Music
- **Tone.js**: Web Audio API framework for audio synthesis, playback, and music creation
- **Audio Visualization**: Custom components for waveform and frequency visualization
- **Real-time Audio**: Support for beat generation, melody playback, and audio effects

### Development and Build Tools
- **Vite**: Fast build tool with HMR and development server integration
- **TypeScript**: Type safety across frontend, backend, and shared code
- **ESBuild**: Fast bundling for production server builds
- **Replit Integration**: Development environment with cartographer and error modal plugins

### UI and User Experience
- **shadcn/ui**: Complete component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **Lucide React**: Consistent icon system throughout the application
- **React Hook Form**: Form handling with Zod validation schemas