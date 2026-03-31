# ⚡ PowerDown — Real-Time Power Outage Reporter

A lightweight, modern, mobile-first web application for real-time power outage reporting. 
**Now built with a full-stack architecture: React + Node.js + PostgreSQL + TypeScript!**

## 🚀 Quick Start

```bash
# Install dependencies for both client and server
npm run install:all

# Initialize PostgreSQL Database (Requires PostgreSQL installed locally with postgres/postgres credentials)
npm run db:init

# Start both frontend and backend dev servers concurrently
npm run dev
```

## 🔧 Configuration

You need to set up environment variables in both the `client/.env` and `server/.env` directories.

### Server Config (`server/.env`)
```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/powerdown
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Client Config (`client/.env`)
```env
# Google Maps (required)
VITE_GOOGLE_MAPS_API_KEY=your_key_here

# Firebase Auth (required)
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Backend URL
VITE_API_URL=http://localhost:3001
```

### Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Maps JavaScript API** and **Visualization** library
3. Create an API key and restrict it to your domain

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project
3. Enable **Authentication** → Sign-in providers:
   - Google
   - Email/Password

## 🚂 Railway Deployment

1. Push the code to GitHub.
2. Connect the repo to Railway.
3. Add a **PostgreSQL** database service in your Railway project.
4. Link the database to your application service.
5. In your application service, set the environment variables:
   - All `VITE_*` variables from `client/.env`
   - Railway will automatically provide `DATABASE_URL` and `PORT`.
6. Railway will auto-detect and run your app using the `install:all`, `build`, and `start` scripts in the root `package.json`.

*Note: In production, the Node.js Express server automatically serves the compiled Vite frontend from `client/dist/` on the same port.*

## 📁 Project Structure

```
├── client/                # React + Vite Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks (auth, location, polling)
│   │   ├── services/      # API and Firebase wrappers
│   │   ├── styles/        # CSS design system
│   │   └── types/         # Shared TypeScript interfaces
│   └── package.json
├── server/                # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/   # Route handlers and DB logic
│   │   ├── db/            # PostgreSQL pool and init script
│   │   ├── middleware/    # Auth verification middleware
│   │   ├── routes/        # Express API routes
│   │   └── types/         # Typescript definitions
│   └── package.json
└── package.json           # Root scripts (dev, build, install:all)
```

## ✨ Features

- 🔐 Firebase Auth (Google OAuth + Email/Password)
- 💾 PostgreSQL Database — robust geospatial storage with proper indexing
- ⚡ Full-Stack TypeScript — strict typing from frontend to backend
- 📍 Auto-detect user location via Geolocation API
- 🗺️ Google Maps with beautiful custom dark theme
- 🔴 Server-side Outage Clustering — dynamically clusters reports using Haversine distance
- 🔥 Heatmap layer weighted by report recency
- 🔄 Real-time polling — automatically fetches new outage reports and updates UI natively in React
- 📊 Live stats dashboard
- 📱 Mobile-first responsive design
- ⏰ Auto-expire reports — old reports are cleared after 2 hours

