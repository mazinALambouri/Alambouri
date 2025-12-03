# Alambouri - Multi-Trip Travel Planning App

A comprehensive travel planning application with authentication, multiple trip management, and sharing capabilities.

## Features

### 🔐 Authentication
- Sign up / Sign in with email and password
- User profiles with full name
- Secure session management
- 🎨 Beautiful, modern UI with smooth animations
- 📊 Automatic cost and distance calculations
- 🏠 Install to home screen on iOS and Android
- 🔍 Browse recommended places by category
- ✏️ Add custom places with images and details

## Tech Stack

- React 19
- TypeScript
- Tailwind CSS 4
- Vite
- IndexedDB (via idb library)
- PWA with Service Worker

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## PWA Installation

### Android
- Visit the app in Chrome
- Tap "Add to Home Screen" when prompted
- Or use the menu → "Install app"

### iOS
- Visit the app in Safari
- Tap the Share button
- Tap "Add to Home Screen"

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Main app screens
├── hooks/          # Custom React hooks
├── lib/            # Utilities and services
├── types/          # TypeScript type definitions
└── data/           # Sample data
```

## Data Model

- **Trip**: Contains name, dates, location, and days
- **Day**: Belongs to a trip, contains date and places
- **Place**: Has name, type, description, images, time, price, and other details

## Offline Support

The app uses:
- Service Worker for offline asset caching
- IndexedDB for persistent data storage
- Cache-first strategy for optimal performance

All trip data is stored locally and survives page refreshes and app restarts.
