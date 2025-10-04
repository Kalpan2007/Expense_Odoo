# Contributing to Expense Management System

First off, thank you for considering contributing to our Expense Management System! It's people like you that make this project such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Development Setup](#development-setup)
- [Development Process](#development-process)
  - [Branch Naming Convention](#branch-naming-convention)
  - [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Style Guide](#style-guide)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (18+)
- npm (latest version)
- Git
- A Supabase account (free tier is sufficient)

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/expense-management-system.git
   cd expense-management-system
   ```
3. Install dependencies:
   ```bash
   npm run install-all
   ```
4. Set up environment variables:
   ```bash
   cp Backend/.env.example Backend/.env
   cp Frontend/.env.example Frontend/.env
   ```
5. Configure your Supabase credentials in the `.env` files
6. Initialize the database:
   ```bash
   cd Backend && npm run init-db
   ```
7. Start the development servers:
   ```bash
   cd .. && npm run dev
   ```

## Development Process

### Branch Naming Convention

- Feature: `feature/description-of-feature`
- Bug Fix: `fix/description-of-bug`
- Documentation: `docs/description-of-changes`
- Performance: `perf/description-of-improvement`

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- feat: A new feature
- fix: A bug fix
- docs: Documentation changes
- style: Code style changes (formatting, missing semi-colons, etc)
- refactor: Code changes that neither fix a bug nor add a feature
- perf: Performance improvements
- test: Adding or updating tests
- chore: Updates to build process or auxiliary tools

Example:
```
feat(expenses): add multi-currency support

- Add currency conversion utility
- Update expense form with currency selector
- Add tests for currency conversion
```

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the documentation with details of any changes to interfaces
3. Ensure your code follows the style guide
4. Add/update tests as needed
5. Submit a pull request with a clear title and description
6. Request review from maintainers

## Project Structure

Our project follows a specific structure. Please maintain this structure when adding new files:

### Backend Structure
```
Backend/
├── src/
│   ├── controllers/     # Business logic
│   ├── middleware/      # Express middleware
│   ├── routes/         # API routes
│   └── utils/          # Utility functions
```

### Frontend Structure
```
Frontend/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── lib/           # Utilities & API
│   └── types/         # TypeScript definitions
```

## Style Guide

### JavaScript/TypeScript
- Use TypeScript for new code
- Follow the ESLint configuration
- Use async/await over promises
- Use functional components with hooks in React
- Follow the Airbnb JavaScript Style Guide

### CSS
- Use Tailwind CSS utility classes
- Follow BEM naming convention for custom CSS
- Maintain responsive design principles

## Testing

- Write tests for new features
- Maintain or improve code coverage
- Test across different browsers and devices
- Include unit tests and integration tests where applicable

### Running Tests
```bash
# Run backend tests
cd Backend && npm test

# Run frontend tests
cd Frontend && npm test
```

## Documentation

- Keep README.md updated
- Document new features
- Update API documentation
- Include JSDoc comments for functions
- Update TypeScript types

## Questions or Need Help?

Feel free to reach out to the maintainers:
- Email: [daxpatel.cg@gmail.com](mailto:daxpatel.cg@gmail.com)
- LinkedIn: [Connect](https://linkedin.com/in/dax-cg)
- Twitter: [Follow](https://twitter.com/dax_CG)

## Thank You!

Your contributions to open source, no matter how small, make projects like this possible. Thank you for being part of our community!