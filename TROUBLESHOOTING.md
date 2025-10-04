# 🔧 Troubleshooting Guide

This guide helps you resolve common issues with the Expense Management Application.

## 🚨 Common Issues

### 1. 401 Unauthorized Error

**Symptoms:**
- `POST http://localhost:5000/api/auth/login 401 (Unauthorized)`
- Cannot login to the application
- API requests fail with 401 status

**Root Causes & Solutions:**

#### A. Missing Supabase Configuration
```bash
# Check if your Backend/.env file has the correct values:
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

**Fix:**
1. Go to [supabase.com](https://supabase.com)
2. Open your project dashboard
3. Go to Settings > API
4. Copy the Project URL and API keys
5. Update your `Backend/.env` file

#### B. Database Not Initialized
**Fix:**
```bash
cd Backend
npm run init-db
```

Or manually run the SQL:
1. Go to your Supabase dashboard
2. Open SQL Editor
3. Copy content from `Backend/src/config/database.sql`
4. Execute the SQL

#### C. User Doesn't Exist in Database
The authentication might succeed in Supabase but fail in our application if the user profile doesn't exist.

**Fix:**
1. Try creating a new account through the signup page
2. Or manually check your Supabase dashboard > Authentication > Users

### 2. CORS Errors

**Symptoms:**
- `Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Fix:**
1. Check that `FRONTEND_URL` in `Backend/.env` matches your frontend URL:
   ```env
   FRONTEND_URL=http://localhost:5173
   ```
2. Restart the backend server after changing environment variables

### 3. Server Won't Start

**Symptoms:**
- `Error: Missing Supabase environment variables`
- `Cannot find module` errors

**Fixes:**

#### Missing Dependencies
```bash
# Install all dependencies
npm run install-all

# Or install individually
cd Backend && npm install
cd ../Frontend && npm install
```

#### Missing Environment Files
```bash
# Create environment files
cp Backend/.env.example Backend/.env
cp Frontend/.env.example Frontend/.env
```

### 4. Database Connection Issues

**Symptoms:**
- `Database error. Please ensure the database is properly initialized.`
- SQL errors in console

**Fixes:**

#### Check Supabase Project Status
1. Go to your Supabase dashboard
2. Ensure project is active (not paused)
3. Check if your IP is blocked

#### Verify Service Role Key
1. Go to Settings > API in Supabase dashboard
2. Copy the `service_role` key (not the `anon` key)
3. Update `SUPABASE_SERVICE_ROLE_KEY` in `Backend/.env`

#### Reinitialize Database
```bash
cd Backend
npm run init-db
```

### 5. Frontend Build Errors

**Symptoms:**
- TypeScript errors
- Module not found errors

**Fixes:**

#### Clear Cache and Reinstall
```bash
cd Frontend
rm -rf node_modules package-lock.json
npm install
```

#### Check TypeScript Configuration
Make sure all required files exist:
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`

### 6. Port Already in Use

**Symptoms:**
- `Error: listen EADDRINUSE: address already in use :::5000`
- `Error: listen EADDRINUSE: address already in use :::5173`

**Fixes:**

#### Find and Kill Process (Windows)
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### Change Ports
Update ports in environment files:
```env
# Backend/.env
PORT=5001

# Frontend/.env  
VITE_API_URL=http://localhost:5001/api
```

## 🔍 Debugging Steps

### 1. Check Backend Health
```bash
curl http://localhost:5000/health
```
Expected response:
```json
{
  "status": "ok",
  "message": "Expense Management API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Verify Environment Variables
```bash
cd Backend
node -e "console.log('SUPABASE_URL:', process.env.SUPABASE_URL)"
```

### 3. Test Database Connection
```bash
cd Backend
node -e "
import { supabase } from './src/config/supabase.js';
supabase.from('companies').select('count').then(console.log);
"
```

### 4. Check Browser Console
1. Open browser developer tools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests

### 5. Check Backend Logs
Look for error messages in the terminal where you started the backend server.

## 📞 Getting Help

If you're still having issues:

1. **Check the setup guide** in `README.md`
2. **Run the setup script**: `npm run setup`
3. **Verify all prerequisites** are met
4. **Check Supabase dashboard** for any issues
5. **Review error messages** carefully - they often contain the solution

## 🎯 Quick Fixes Checklist

- [ ] Supabase project is created and active
- [ ] Environment variables are correctly set
- [ ] Database schema is initialized
- [ ] All dependencies are installed
- [ ] Ports 5000 and 5173 are available
- [ ] Both servers are running
- [ ] CORS is properly configured

## 💡 Pro Tips

1. **Always restart servers** after changing environment variables
2. **Check the Supabase dashboard** for authentication and database issues
3. **Use browser dev tools** to see detailed error messages
4. **Check both frontend and backend console logs** for errors
5. **Ensure your internet connection is stable** for Supabase requests

---

**Still need help?** The error messages usually contain valuable clues - read them carefully! 🔍