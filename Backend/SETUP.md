# Backend Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)

## Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project
3. Wait for the project to be ready
4. Go to Settings > API to get your credentials

### 2. Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Initialize Database

**Option A: Automatic Setup (Recommended)**
```bash
npm run init-db
```

**Option B: Manual Setup**
1. Go to your Supabase dashboard
2. Open the SQL Editor
3. Copy and paste the contents of `src/config/database.sql`
4. Run the SQL script

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm run init-db` - Initialize database schema

## API Endpoints

- `GET /health` - Health check
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

## Troubleshooting

### 401 Unauthorized Error

This usually means:
1. Supabase credentials are missing or incorrect
2. Database schema is not set up
3. User doesn't exist in the database

**Solutions:**
1. Check your `.env` file
2. Run `npm run init-db` to set up the database
3. Make sure you've created a user account

### CORS Issues

If you get CORS errors:
1. Check that `FRONTEND_URL` in `.env` matches your frontend URL
2. Make sure the frontend is running on the correct port

### Database Connection Issues

1. Verify your Supabase project is active
2. Check that your service role key has the correct permissions
3. Ensure your IP is not blocked by Supabase

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a production-ready database
3. Configure proper CORS origins
4. Use HTTPS in production