# Contributing to CHL App

Thank you for your interest in contributing to CHL App! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/chlapp.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Follow the setup instructions in [SETUP.md](./SETUP.md)

## Development Workflow

### Backend Development

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Frontend Development

```bash
cd frontend
npm run dev
```

## Code Style

### Python (Backend)
- Follow PEP 8 style guide
- Use type hints where possible
- Add docstrings to functions and classes
- Maximum line length: 100 characters

### JavaScript/React (Frontend)
- Follow ESLint rules (configured in project)
- Use functional components with hooks
- Use meaningful variable and function names
- Add comments for complex logic

## Commit Messages

Use clear, descriptive commit messages:

```
feat: Add user authentication
fix: Resolve CORS issue with API calls
docs: Update README with setup instructions
refactor: Simplify habit service logic
```

## Pull Request Process

1. Ensure your code follows the style guidelines
2. Update documentation if needed
3. Add tests if applicable
4. Ensure all tests pass
5. Create a pull request with a clear description
6. Reference any related issues

## Testing

### Backend Testing
- Add tests for new endpoints
- Test error handling
- Verify database operations

### Frontend Testing
- Test component rendering
- Test user interactions
- Verify API integration

## Reporting Bugs

Use the bug report template in Issues. Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details

## Requesting Features

Use the feature request template in Issues. Include:
- Clear description of the feature
- Use case or problem it solves
- Proposed implementation (if any)

## Questions?

Feel free to open an issue for questions or discussions.
