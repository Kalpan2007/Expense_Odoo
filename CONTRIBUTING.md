# 🤝 **Contributing to Expense Management System**

<div align="center">

*Thank you for your interest in contributing to our project! Together, we can build the best expense management solution.*

[![Contributors](https://img.shields.io/github/contributors/yourusername/expense-management-system?style=for-the-badge)](https://github.com/yourusername/expense-management-system/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/yourusername/expense-management-system?style=for-the-badge)](https://github.com/yourusername/expense-management-system/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/yourusername/expense-management-system?style=for-the-badge)](https://github.com/yourusername/expense-management-system/pulls)

</div>

---

## 🚀 **Getting Started**

### 📋 **Prerequisites**

Before contributing, ensure you have:
- 🟢 **Node.js 18+** installed
- 📦 **npm** or **yarn** package manager
- 🗄️ **Supabase account** for testing
- 🎯 **Git** for version control
- 💻 **Code editor** (VS Code recommended)

### 🛠️ **Development Setup**

1. **🍴 Fork the Repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **📥 Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/expense-management-system.git
   cd expense-management-system
   ```

3. **🔗 Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/expense-management-system.git
   ```

4. **📦 Install Dependencies**
   ```bash
   npm run install-all
   ```

5. **⚙️ Setup Environment**
   ```bash
   cp Backend/.env.example Backend/.env
   cp Frontend/.env.example Frontend/.env
   # Configure your Supabase credentials
   ```

6. **🗄️ Initialize Database**
   ```bash
   cd Backend && npm run init-db
   ```

7. **🚀 Start Development**
   ```bash
   cd .. && npm run dev
   ```

---

## 📝 **How to Contribute**

### 🐛 **Reporting Bugs**

**Before submitting a bug report:**
- ✅ Check existing issues to avoid duplicates
- 🔍 Search closed issues for previous solutions
- 📊 Gather relevant information about your environment

**Bug Report Template:**
```markdown
## 🐛 Bug Description
A clear description of what the bug is.

## 🔄 Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## ✅ Expected Behavior
What you expected to happen.

## 📸 Screenshots
If applicable, add screenshots.

## 🖥️ Environment
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 91]
- Node.js: [e.g. 18.0.0]
- npm: [e.g. 8.0.0]
```

### 💡 **Suggesting Features**

**Feature Request Template:**
```markdown
## 🚀 Feature Description
A clear description of the feature you'd like to see.

## 🎯 Problem Solved
What problem does this feature solve?

## 💭 Proposed Solution
How would you like this feature to work?

## 🔄 Alternative Solutions
Any alternative solutions you've considered.

## ➕ Additional Context
Any other context or screenshots.
```

### 🔧 **Code Contributions**

#### **🌿 Branch Naming Convention**
```bash
# Feature branches
feature/expense-category-filtering
feature/receipt-ocr-enhancement

# Bug fix branches
bugfix/login-redirect-issue
bugfix/currency-conversion-error

# Documentation updates
docs/api-documentation-update
docs/setup-guide-improvement
```

#### **💾 Commit Message Guidelines**

Follow the **Conventional Commits** specification:

```bash
# Feature commits
feat(auth): add OAuth2 integration
feat(expenses): implement bulk expense upload

# Bug fixes
fix(api): resolve currency conversion error
fix(ui): correct responsive layout issues

# Documentation
docs(readme): update installation instructions
docs(api): add endpoint documentation

# Refactoring
refactor(utils): optimize date formatting functions
refactor(components): simplify expense form logic

# Performance improvements
perf(db): optimize expense query performance
perf(ui): reduce bundle size with code splitting

# Tests
test(auth): add unit tests for login flow
test(expenses): add integration tests for CRUD operations
```

#### **🔄 Pull Request Process**

1. **🔄 Sync with Upstream**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **🌿 Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **💻 Make Your Changes**
   - Follow coding standards
   - Add tests for new features
   - Update documentation
   - Ensure all tests pass

4. **✅ Test Your Changes**
   ```bash
   # Run frontend tests
   cd Frontend && npm test
   
   # Run backend tests
   cd Backend && npm test
   
   # Run full application
   npm run dev
   ```

5. **📤 Submit Pull Request**
   - Use descriptive title and description
   - Reference related issues
   - Include screenshots for UI changes
   - Mark as draft if work in progress

**Pull Request Template:**
```markdown
## 📝 Description
Brief description of changes made.

## 🔗 Related Issues
Fixes #(issue number)

## 🧪 Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing done

## 📸 Screenshots
[Include screenshots for UI changes]

## ✅ Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes
```

---

## 📏 **Coding Standards**

### 🎯 **TypeScript Guidelines**

```typescript
// ✅ Good: Use descriptive names
interface UserExpenseData {
  amount: number;
  currency: string;
  category: ExpenseCategory;
  submittedAt: Date;
}

// ❌ Bad: Vague naming
interface Data {
  amt: number;
  cur: string;
  cat: any;
  date: any;
}
```

### 🎨 **React Component Standards**

```tsx
// ✅ Good: Functional component with proper typing
interface ExpenseFormProps {
  onSubmit: (expense: Expense) => Promise<void>;
  initialData?: Partial<Expense>;
  isLoading?: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false
}) => {
  // Component logic here
};

export default ExpenseForm;
```

### 🔙 **Backend API Standards**

```javascript
// ✅ Good: Consistent error handling
export async function createExpense(req, res) {
  try {
    const { amount, currency, category } = req.body;
    
    // Validation
    if (!amount || !currency || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: { amount, currency, category }
      });
    }
    
    const expense = await expenseService.create({
      ...req.body,
      userId: req.user.id
    });
    
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
```

### 🎨 **CSS/Styling Guidelines**

```css
/* ✅ Good: Use Tailwind utility classes */
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-800">Expense Details</h2>
  <button className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
    Submit
  </button>
</div>

/* ✅ Good: Custom CSS when needed */
.expense-chart {
  @apply w-full h-64 p-4 bg-gray-50 rounded-lg;
}

.expense-chart canvas {
  @apply max-w-full max-h-full;
}
```

---

## 🧪 **Testing Guidelines**

### ⚛️ **Frontend Testing**

```typescript
// Unit test example
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpenseForm } from './ExpenseForm';

describe('ExpenseForm', () => {
  it('should submit form with valid data', async () => {
    const mockOnSubmit = jest.fn();
    
    render(<ExpenseForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '100.50' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        amount: 100.50,
        // ... other expected data
      });
    });
  });
});
```

### 🔙 **Backend Testing**

```javascript
// API test example
import request from 'supertest';
import app from '../src/server';

describe('POST /api/expenses', () => {
  it('should create expense with valid data', async () => {
    const expenseData = {
      amount: 100.50,
      currency: 'USD',
      category: 'meals',
      description: 'Team lunch'
    };
    
    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${validToken}`)
      .send(expenseData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.amount).toBe(100.50);
  });
});
```

---

## 📚 **Documentation Guidelines**

### 📝 **Code Documentation**

```typescript
/**
 * Calculates the total expense amount in the company's base currency
 * 
 * @param expenses - Array of expense records
 * @param baseCurrency - Company's base currency code (e.g., 'USD')
 * @param exchangeRates - Current exchange rates object
 * @returns Promise resolving to total amount in base currency
 * 
 * @example
 * ```typescript
 * const total = await calculateTotalInBaseCurrency(
 *   expenses,
 *   'USD',
 *   { EUR: 1.1, GBP: 1.3 }
 * );
 * ```
 */
export async function calculateTotalInBaseCurrency(
  expenses: Expense[],
  baseCurrency: string,
  exchangeRates: ExchangeRates
): Promise<number> {
  // Implementation here
}
```

### 📖 **API Documentation**

```markdown
## POST /api/expenses

Creates a new expense record.

### Request Body

```json
{
  "amount": 100.50,
  "currency": "USD",
  "category": "meals",
  "description": "Team lunch",
  "expenseDate": "2023-12-01"
}
```

### Response

**Success (201)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 100.50,
    "status": "pending",
    "createdAt": "2023-12-01T10:00:00Z"
  }
}
```

**Error (400)**
```json
{
  "error": "Validation failed",
  "details": {
    "amount": "Amount is required"
  }
}
```
```

---

## 🔍 **Code Review Guidelines**

### ✅ **What to Look For**

- **🔒 Security**: No sensitive data exposed
- **🎯 Performance**: Efficient algorithms and queries
- **📱 Accessibility**: Proper ARIA labels and keyboard navigation
- **🧪 Tests**: Adequate test coverage
- **📚 Documentation**: Clear comments and documentation
- **🎨 UI/UX**: Consistent design and user experience

### 💬 **Review Etiquette**

- **🎯 Be Specific**: Point to exact lines and suggest improvements
- **💡 Be Constructive**: Offer solutions, not just problems
- **🙏 Be Respectful**: Remember there's a person behind the code
- **📚 Educate**: Share knowledge and best practices
- **⚡ Be Timely**: Review promptly to maintain momentum

---

## 🏆 **Recognition**

### 🌟 **Contributor Levels**

| Level | Contributions | Benefits |
|:---:|:---|:---|
| 🥉 **Bronze** | 1-5 PRs merged | Listed in contributors |
| 🥈 **Silver** | 6-15 PRs merged | Special badge + early access |
| 🥇 **Gold** | 16+ PRs merged | Maintainer consideration |

### 🎊 **Hall of Fame**

We recognize outstanding contributors in our:
- 📊 **Monthly Contributors** - Most active contributors
- 🐛 **Bug Hunters** - Best bug reports and fixes
- 📚 **Documentation Heroes** - Documentation improvements
- 🚀 **Feature Champions** - Best new features

---

## 📞 **Getting Help**

### 💬 **Communication Channels**

- 🐛 **Issues**: For bugs and feature requests
- 💬 **Discussions**: For questions and general chat
- 📧 **Email**: maintainers@expense-management.com
- 💻 **Discord**: [Join our server](https://discord.gg/expense-mgmt)

### 🆘 **Need Help?**

Don't hesitate to ask for help! We're here to support you:

- 🤔 **Stuck on setup?** Create a setup help issue
- 🐛 **Found a bug?** We'll help you debug it
- 💡 **Have an idea?** Let's discuss implementation
- 🧪 **Testing issues?** We'll guide you through it

---

<div align="center">

### 🚀 **Ready to Contribute?**

*Every contribution, no matter how small, makes a difference!*

[![Start Contributing](https://img.shields.io/badge/Start_Contributing-Now-green?style=for-the-badge)](https://github.com/yourusername/expense-management-system/issues/good-first-issue)

---

**Thank you for making our project better! 🙏**

</div>