# Expense Management System

A comprehensive, production-ready expense management system with multi-currency support, role-based access control, and flexible approval workflows.

## Features

### Core Functionality
- **Multi-currency support** with real-time exchange rates
- **Role-based access control** (Admin, Manager, Employee)
- **Multi-level approval workflows** with conditional rules
- **OCR receipt scanning** for automatic expense data extraction
- **Real-time analytics** and reporting dashboards
- **Company isolation** for multi-tenant support

### User Roles & Permissions

**Admin**
- Create and manage users
- Configure approval rules
- View all company expenses
- Manage company settings
- Override approvals

**Manager**
- Approve/reject expenses
- View team expenses
- Access approval queue
- View analytics

**Employee**
- Submit expense claims
- Upload receipts
- Track expense status
- View personal expense history

### Approval System

**Multi-level Workflows**
- Sequential approval steps
- Manager-first approval option
- Multiple approvers per step

**Conditional Rules**
- Percentage-based approval (e.g., 60% threshold)
- Specific approver bypass (e.g., CFO auto-approves)
- Hybrid rules (combine both methods)

## Tech Stack

### Frontend
- React 18.3
- TypeScript 5.5
- Vite 5.4
- Tailwind CSS 3.4
- Supabase Client
- Lucide React (icons)

### Backend
- Node.js 18+
- Express.js
- Supabase (PostgreSQL + Auth)
- Tesseract.js (OCR)
- Axios

### Database
- PostgreSQL (via Supabase)
- Row Level Security (RLS)
- Automatic timestamps
- Foreign key constraints

## Project Structure

```
.
├── Backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database & app configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, upload, etc.
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Currency, OCR utilities
│   │   └── server.js       # Express server
│   ├── package.json
│   └── README.md
│
└── Frontend/               # React + TypeScript app
    ├── src/
    │   ├── components/     # UI components
    │   ├── contexts/       # React contexts
    │   ├── lib/           # API client
    │   └── types/         # TypeScript types
    ├── package.json
    └── vite.config.ts
```

## Installation & Setup

### 1. Database Setup

1. Go to your Supabase project at https://supabase.com
2. Navigate to SQL Editor
3. Run the SQL from `Backend/src/config/database.sql`

### 2. Backend Setup

```bash
cd Backend
npm install

# Configure environment variables in .env
cp .env.example .env

# Start the backend server
npm run dev
```

The backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd Frontend
npm install

# Configure environment variables in .env.local
# (Already configured in the project)

# Start the frontend dev server
npm run dev
```

The frontend will run on http://localhost:5173

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest
COUNTRIES_API_URL=https://restcountries.com/v3.1/all?fields=name,currencies
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## API Endpoints

### Authentication
```
POST   /api/auth/signup      - Register new user and company
POST   /api/auth/login       - Login user
POST   /api/auth/logout      - Logout user
GET    /api/auth/me          - Get current user
```

### Users (Admin only)
```
GET    /api/users            - Get all users in company
POST   /api/users            - Create new user
PUT    /api/users/:id        - Update user
DELETE /api/users/:id        - Delete user
```

### Expenses
```
GET    /api/expenses         - Get all expenses
POST   /api/expenses         - Create new expense
PUT    /api/expenses/:id     - Update expense
DELETE /api/expenses/:id     - Delete expense
POST   /api/expenses/scan-receipt - OCR scan receipt
```

### Approvals
```
GET    /api/approvals/workflows              - Get approval workflows
POST   /api/approvals/expenses/:id/approve   - Approve expense
POST   /api/approvals/expenses/:id/reject    - Reject expense
GET    /api/approvals/rules                  - Get approval rules
POST   /api/approvals/rules                  - Create approval rule (Admin)
PUT    /api/approvals/rules/:id              - Update approval rule (Admin)
DELETE /api/approvals/rules/:id              - Delete approval rule (Admin)
```

### Currency
```
GET    /api/currency/exchange-rates?baseCurrency=USD  - Get exchange rates
GET    /api/currency/countries                        - Get countries with currencies
```

## Usage Guide

### 1. First-time Setup

1. Navigate to the frontend (http://localhost:5173)
2. Click "Sign up"
3. Enter your details and select your country
4. Company currency will be auto-set based on country
5. You'll be created as an Admin

### 2. Creating Users

As an Admin:
1. Go to "User Management"
2. Click "Add User"
3. Enter user details and assign role
4. Set manager relationships if needed
5. Enable "Manager Approver" if manager should approve first

### 3. Submitting Expenses

As an Employee:
1. Go to "Submit Expense"
2. Fill in expense details or scan a receipt
3. Select currency and category
4. Submit for approval

### 4. Approval Workflow

As a Manager:
1. Go to "Approval Queue"
2. Review pending expenses
3. Approve or reject with comments
4. Expense moves to next approver if configured

### 5. Setting Approval Rules

As an Admin:
1. Go to "Approval Rules"
2. Create new rule (Percentage, Specific Approver, or Hybrid)
3. Set thresholds and configure approvers
4. Activate the rule

## Multi-Currency Support

- Employees can submit expenses in any currency
- System automatically converts to company's base currency
- Exchange rates updated hourly
- Both original and converted amounts displayed

## OCR Receipt Scanning

1. Upload receipt image (JPEG, PNG, PDF)
2. System extracts:
   - Amount
   - Date
   - Merchant name
   - Description
3. Review and edit if needed
4. Submit expense

## Security Features

- JWT-based authentication
- Row Level Security (RLS) on all tables
- Company-level data isolation
- Role-based authorization
- Input validation
- File upload restrictions
- CORS protection

## Database Schema

### Tables
- `companies` - Company information
- `users` - User accounts with roles
- `expenses` - Expense claims
- `approval_workflows` - Approval tracking
- `approval_rules` - Conditional approval rules

All tables have:
- Automatic timestamps (created_at, updated_at)
- Row Level Security policies
- Foreign key constraints
- Proper indexes

## Development

### Running Tests
```bash
# Backend
cd Backend
npm test

# Frontend
cd Frontend
npm test
```

### Building for Production
```bash
# Backend
cd Backend
npm start

# Frontend
cd Frontend
npm run build
npm run preview
```

## Troubleshooting

### Backend won't start
- Check if Supabase credentials are correct
- Ensure PostgreSQL database is accessible
- Verify all environment variables are set

### Frontend can't connect
- Confirm backend is running on port 5000
- Check VITE_API_URL in .env.local
- Verify CORS is enabled in backend

### Database errors
- Run the SQL migration script
- Check RLS policies are enabled
- Verify user has proper permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open a GitHub issue or contact support.

---

Built with modern best practices and production-ready code quality.
