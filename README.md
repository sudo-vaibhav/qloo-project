# TasteTailor - AI-Powered Style Discovery Platform

Transform your cultural tastes into personalized fashion and decor recommendations through AI-powered taste analysis.

## What it does

" **Cultural Analysis**: Share your favorite movies, music, and artists to discover your unique aesthetic DNA
" **AI Generation**: Creates personalized style narratives and visual mood boards using OpenAI
" **Personal Gallery**: Save, refine, and share your style boards with friends and community
" **Smart Recommendations**: Uses Qloo's Taste AI to correlate cultural preferences with fashion/decor items

## Tech Stack

**Frontend**: Next.js 15, React 19, TailwindCSS, TypeScript  
**Backend**: MongoDB with Mongoose, Clerk authentication  
**AI/APIs**: OpenAI GPT-4, Qloo Taste AI API  
**Storage**: File uploads and image generation  

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
QLOO_API_KEY=your_qloo_api_key
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Features

" Create style boards based on cultural tastes
" AI-generated clothing item recommendations  
" Shareable style boards with unique URLs
" Favorites system for saving preferred boards
" User authentication with Clerk
" Responsive design with modern UI

## API Endpoints

" `POST /api/generate` - Generate style boards from cultural inputs
" `GET/POST /api/styleboards` - Manage user style boards  
" `GET/POST /api/favorites` - Handle favorite boards
" `POST /api/generate-stream` - Streaming AI generation