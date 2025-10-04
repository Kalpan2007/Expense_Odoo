# Quick Start Guide

Get the Expense Management System running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Terminal/Command Line

## Step 1: Database Setup (2 minutes)

1. Log in to https://supabase.com
2. Go to your project or create a new one
3. Click on "SQL Editor" in the left sidebar
4. Copy the contents of `Backend/src/config/database.sql`
5. Paste into the SQL Editor
6. Click "Run" to execute

Your database is now ready!

## Step 2: Backend Setup (1 minute)

```bash
# Navigate to Backend directory
cd Backend

# Install dependencies
npm install

# The .env file is already configured
# If you need to update Supabase credentials, edit Backend/.env

# Start the backend server
npm run dev
```

You should see: `Server is running on port 5000`

## Step 3: Frontend Setup (1 minute)

Open a new terminal window:

```bash
# Navigate to Frontend directory
cd Frontend

# Install dependencies
npm install

# The .env.local file is already configured
# Start the frontend dev server
npm run dev
```

You should see: `Local: http://localhost:5173/`

## Step 4: Access the Application

1. Open your browser to http://localhost:5173
2. Click "Sign up" to create your account
3. Fill in your details and select your country
4. Your company will be automatically created!

## What's Next?

### As an Admin (your initial role):

1. **Create Users**
   - Go to "User Management"
   - Add employees and managers
   - Assign roles and set up manager relationships

2. **Configure Approval Rules**
   - Go to "Approval Rules"
   - Create percentage-based rules (e.g., 60% approval)
   - Or create specific approver rules (e.g., CFO auto-approves)

3. **View Analytics**
   - Check the dashboard for expense insights
   - Monitor approval workflows

### As an Employee:

1. **Submit Expenses**
   - Click "Submit Expense"
   - Fill in details or scan a receipt
   - Track status in real-time

### As a Manager:

1. **Review Expenses**
   - Go to "Approval Queue"
   - Approve or reject pending expenses
   - Add comments for employees

## Testing the System

### Test Multi-Currency

1. Submit an expense in a different currency (e.g., EUR)
2. See automatic conversion to your company's currency
3. Both amounts are displayed

### Test Approval Workflow

1. As Admin, create a Manager user
2. As Admin, create an Employee and assign the Manager
3. Log in as Employee and submit an expense
4. Log in as Manager and approve it
5. See the expense status update in real-time

### Test OCR Receipt Scanning

1. Go to "Submit Expense"
2. Click "Scan Receipt"
3. Upload a receipt image
4. See automatically extracted data
5. Review and submit

## Troubleshooting

### Backend won't start

**Error: Missing Supabase environment variables**
- Check `Backend/.env` has valid SUPABASE_URL and SUPABASE_ANON_KEY
- Get these from Supabase dashboard → Settings → API

**Port 5000 already in use**
- Change PORT in `Backend/.env` to 5001 or another port
- Update VITE_API_URL in `Frontend/.env.local` to match

### Frontend can't connect

**Network error**
- Ensure backend is running on port 5000
- Check `Frontend/.env.local` has VITE_API_URL=http://localhost:5000/api

**Build errors**
- Delete `node_modules` and run `npm install` again
- Clear browser cache

### Database errors

**Table doesn't exist**
- Re-run the SQL migration from `Backend/src/config/database.sql`

**Permission denied**
- Ensure RLS policies were created in the migration
- Check Supabase Auth is enabled

## API Testing

Test the backend directly:

```bash
# Health check
curl http://localhost:5000/health

# Should return:
# {"status":"ok","message":"Expense Management API is running"}
```

## Environment Variables Reference

### Backend (.env)
```
PORT=5000
SUPABASE_URL=your_url_here
SUPABASE_ANON_KEY=your_key_here
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_SUPABASE_ANON_KEY=your_key_here
```

## Production Deployment

### Backend
```bash
cd Backend
npm start
```

### Frontend
```bash
cd Frontend
npm run build
# Deploy the dist/ folder to your hosting provider
```

## Features to Explore

- [x] Multi-currency expense submission
- [x] OCR receipt scanning
- [x] Multi-level approval workflows
- [x] Conditional approval rules
- [x] Real-time analytics
- [x] Role-based dashboards
- [x] User management
- [x] Expense history tracking

## Need Help?

- Check the main README.md for detailed documentation
- Review API endpoints in Backend/README.md
- Open an issue on GitHub

---

Happy expense tracking!
