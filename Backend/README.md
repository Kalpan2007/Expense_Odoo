# Expense Management Backend API

Node.js + Express + Supabase backend for the Expense Management System.

## Features

- **Authentication & Authorization**: Supabase Auth with role-based access control
- **User Management**: Create, update, delete users with role assignment
- **Expense Management**: Submit, view, update expenses with multi-currency support
- **Approval Workflows**: Multi-level approval system with conditional rules
- **OCR Receipt Scanning**: Extract expense data from receipt images using Tesseract.js
- **Currency Conversion**: Real-time exchange rates for 150+ currencies
- **Multi-tenant**: Company-level data isolation

## Tech Stack

- Node.js 18+
- Express.js
- Supabase (PostgreSQL + Auth)
- Tesseract.js (OCR)
- Axios (HTTP client)

## Installation

```bash
cd Backend
npm install
```

## Database Setup

1. Go to your Supabase project SQL Editor
2. Run the SQL from `src/config/database.sql`
3. This creates all necessary tables and indexes

## Environment Variables

Create a `.env` file in the Backend directory:

```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest
COUNTRIES_API_URL=https://restcountries.com/v3.1/all?fields=name,currencies
```

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user and company
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users in company
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense (Employee/Admin)
- `DELETE /api/expenses/:id` - Delete expense (Employee/Admin)
- `POST /api/expenses/scan-receipt` - OCR scan receipt

### Approvals
- `GET /api/approvals/workflows` - Get approval workflows
- `POST /api/approvals/expenses/:id/approve` - Approve expense (Manager/Admin)
- `POST /api/approvals/expenses/:id/reject` - Reject expense (Manager/Admin)
- `GET /api/approvals/rules` - Get approval rules
- `POST /api/approvals/rules` - Create approval rule (Admin only)
- `PUT /api/approvals/rules/:id` - Update approval rule (Admin only)
- `DELETE /api/approvals/rules/:id` - Delete approval rule (Admin only)

### Currency
- `GET /api/currency/exchange-rates?baseCurrency=USD` - Get exchange rates
- `GET /api/currency/countries` - Get countries with currencies

## Authentication Flow

1. User signs up with email/password
2. Supabase creates auth user and returns JWT
3. Backend creates company and user record
4. Frontend stores JWT in localStorage
5. All subsequent requests include JWT in Authorization header

## Role-Based Access Control

- **Admin**: Full access to all features
- **Manager**: Approve/reject expenses, view team expenses
- **Employee**: Submit expenses, view own expenses

## Multi-Currency Support

- Expenses can be submitted in any currency
- Automatic conversion to company's base currency
- Real-time exchange rates from Exchange Rate API
- Rates cached for 1 hour for performance

## Approval Workflow

1. Employee submits expense
2. If "is_manager_approver" is true, manager approves first
3. Expense moves through approval chain
4. Conditional rules can auto-approve:
   - Percentage rule (e.g., 60% approval)
   - Specific approver rule (e.g., CFO auto-approves)
   - Hybrid rule (combination of both)

## OCR Receipt Scanning

1. Upload receipt image (JPEG, PNG, PDF)
2. Tesseract.js extracts text
3. Parser identifies amount, date, merchant
4. Returns structured expense data
5. User can review and submit

## Error Handling

All endpoints return consistent error format:
```json
{
  "error": "Error message"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Security

- JWT-based authentication
- Role-based authorization middleware
- Company-level data isolation
- Input validation
- File upload restrictions
- CORS protection

## Testing

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Expense Management API is running",
  "timestamp": "2025-10-04T..."
}
```
