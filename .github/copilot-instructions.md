# Qloo Project - Copilot Instructions

## Project Overview
This is a Next.js 15 application called "Qloo Project" - a style board creation platform that leverages AI to generate personalized style recommendations based on cultural tastes and influences.

## Tech Stack
- **Framework**: Next.js 15.4.4 with App Router (TypeScript)
- **Authentication**: Clerk (@clerk/nextjs)
- **Database**: MongoDB with Mongoose ODM
- **UI**: Tailwind CSS 4.x with custom gradients and animations
- **Icons**: Lucide React
- **AI Integration**: OpenAI API for content generation, Qloo API for taste intelligence

## Architecture & File Structure

### Core Models (`src/models/`)
- **StyleBoard.ts**: Main entity storing user-created style boards with AI-generated content
- **User.ts**: User profiles linked to Clerk authentication
- **Favorite.ts**: Junction table for user-styleboard favorites relationship

### API Routes (`src/app/api/`)
- **styleboards/**: CRUD operations for style boards
- **favorites/**: Add/remove/list favorites functionality  
- **generate/**: AI content generation using OpenAI and Qloo APIs

### Pages (`src/app/`)
- **dashboard/**: Main user dashboard with style board grid
- **favorites/**: Dedicated favorites view page
- **create/**: Style board creation form
- **board/[id]/**: Individual style board detail view
- **share/[shareId]/**: Public sharing functionality

### Key Libraries (`src/lib/`)
- **db.ts**: MongoDB connection management
- **qloo.ts**: Qloo API integration for taste intelligence
- **openai.ts**: OpenAI integration for content generation

## Key Features Implemented

### 1. Style Board Creation
- Users input 3-10 cultural tastes/influences
- AI generates title, description, narrative, and tags
- Qloo API provides taste intelligence and recommendations
- OpenAI generates relevant imagery

### 2. Favorites System (Recently Added)
- Users can favorite/unfavorite style boards
- Dedicated favorites page with grid layout
- Real-time favorite status tracking
- Heart icon toggles in board detail and dashboard views

### 3. Sharing & Discovery
- Public sharing with unique shareId using nanoid
- Share URL generation and clipboard copying
- Dashboard grid view with hover effects and actions

## Database Schema

### StyleBoard
```typescript
{
  userId: string;           // Clerk user ID
  title: string;           // AI-generated title
  description: string;     // Brief description
  tastesInput: string[];   // User's original taste inputs
  narrative: string;       // AI-generated narrative
  imageUrl: string;        // Generated/curated image
  tags: string[];          // Style tags
  isPublic: boolean;       // Sharing status
  shareId?: string;        // Unique sharing identifier
  timestamps: true
}
```

### Favorite
```typescript
{
  userId: string;          // Clerk user ID  
  styleBoardId: string;    // Reference to StyleBoard
  timestamps: true
}
```

## UI/UX Patterns

### Design System
- **Color Scheme**: Purple-pink gradients with orange accents
- **Background**: Gradient from purple-50 via pink-50 to orange-50
- **Cards**: White/80 opacity with backdrop-blur-sm effects
- **Animations**: Hover transforms, loading spinners, fade transitions

### Component Patterns
- **Loading States**: Consistent spinning purple border animations
- **Error Handling**: Graceful fallbacks with redirect to dashboard
- **Image Optimization**: Next.js Image component with proper sizing
- **Responsive Design**: Mobile-first with sm/md/lg breakpoints

## API Integration Details

### Qloo API Integration
- Taste intelligence and cultural recommendations
- Entity search and insights endpoints
- Used for enriching user taste inputs
- Provides cross-domain recommendations

### OpenAI Integration  
- Content generation for titles, descriptions, narratives
- Tag generation based on taste inputs
- Potential image generation (DALL-E integration)

## Authentication & Security
- Clerk handles all user authentication
- Server-side auth checks in API routes using `auth()` from `@clerk/nextjs/server`
- User isolation - users only see their own boards + public shared ones

## Recent Implementations (Favorites Feature)

### Files Added/Modified:
1. **src/models/Favorite.ts** - New model for favorites
2. **src/app/api/favorites/route.ts** - CRUD API for favorites
3. **src/app/api/favorites/[styleBoardId]/route.ts** - Check favorite status
4. **src/app/favorites/page.tsx** - Dedicated favorites page
5. **src/app/board/[id]/page.tsx** - Added favorite toggle functionality
6. **src/app/dashboard/page.tsx** - Added favorites navigation link

### Key Implementation Notes:
- Compound unique index on (userId, styleBoardId) prevents duplicate favorites
- Error handling for duplicate favorites (11000 MongoDB error code)
- Real-time UI updates without page refresh
- Consistent heart icon states (filled/unfilled, red/gray colors)

## Development Patterns

### Code Style
- Use `'use client'` directive for client components
- Async/await pattern for API calls
- Proper TypeScript interfaces for all data structures
- Consistent error handling with try/catch blocks

### State Management
- React useState for local component state
- useEffect for data fetching on component mount
- No external state management (Redux/Zustand) - keeping it simple

### Error Handling
- Network errors logged to console
- User-friendly fallbacks (redirect to dashboard)
- Loading states for all async operations
- Graceful degradation for missing data

## Future Enhancement Areas
- Advanced filtering/search in favorites
- Categories/collections for better organization  
- Social features (following users, public galleries)
- Advanced Qloo integration (demographic insights, trend analysis)
- Performance optimizations (infinite scroll, image lazy loading)
- Mobile app (React Native/Expo)

## Development Commands
```bash
npm run dev          # Development server with Turbopack
npm run build        # Production build
npm run lint         # ESLint checking
```