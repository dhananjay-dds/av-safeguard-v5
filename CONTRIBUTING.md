# Contributing to AV Safeguard v5

Thank you for your interest in contributing to AV Safeguard v5! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please be respectful and constructive in all interactions with other contributors.

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
git clone https://github.com/YOUR-USERNAME/av-safeguard-v5.git
cd av-safeguard-v5
git remote add upstream https://github.com/dhananjay-dds/av-safeguard-v5.git
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
# or
git checkout -b docs/your-documentation
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions
- `chore/` - Build, dependencies, or tooling

### 3. Set Up Development Environment

```bash
npm install
npm run dev
```

## Development Workflow

### Running Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# E2E tests
npx playwright test

# Coverage
npm test -- --coverage
```

### Linting and Formatting

```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Format code
npm run format

# Check formatting without changes
npm run format:check
```

### Type Checking

```bash
npm run type-check
```

### Building

```bash
# Development build
npm run build:dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Commit Guidelines

We follow conventional commits for clear and semantic commit messages.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation only changes
- `style` - Changes that don't affect code meaning (formatting, etc.)
- `refactor` - A code change that neither fixes a bug nor adds a feature
- `perf` - A code change that improves performance
- `test` - Adding missing tests or correcting existing tests
- `chore` - Changes to build process, dependencies, or tooling

### Examples

```bash
git commit -m "feat: add user authentication module"
git commit -m "fix: resolve memory leak in data fetching"
git commit -m "docs: update API documentation"
git commit -m "refactor: simplify component structure"
```

## Pull Request Process

### 1. Before Submitting

- [ ] Code follows the project's style guide
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] No console errors in development
- [ ] Documentation is updated if needed

### 2. Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create PR on GitHub
# - Use a descriptive title
# - Link related issues
# - Describe changes clearly
```

### 3. PR Template

```markdown
## Description
Brief description of what this PR does.

## Related Issue
Closes #(issue number)

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## Changes
- Change 1
- Change 2
- Change 3

## Testing
Describe the testing you've done:
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] E2E tests added/updated

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented complex areas
- [ ] I have updated documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests for my changes
- [ ] New and existing unit tests pass
```

### 4. Review Process

- Maintainers will review your code
- Address feedback and iterate
- Once approved, your PR will be merged

## Reporting Issues

### Bug Report

1. Use a descriptive title
2. Describe the bug clearly
3. Provide steps to reproduce
4. Expected vs actual behavior
5. Screenshots/logs if applicable
6. Your environment (OS, Node version, etc.)

### Feature Request

1. Clear description of the feature
2. Use case and benefits
3. Possible implementation approach
4. Alternatives considered

## Style Guide

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules (enforced via pre-commit hooks)
- Use Prettier for formatting
- Max line length: 100 characters

### Component Guidelines

- Use functional components with hooks
- Props should be typed with TypeScript
- Use descriptive component names
- Add PropTypes or TypeScript interfaces
- Document complex logic with comments

### Naming Conventions

```typescript
// Components: PascalCase
const MyComponent = () => { ... }

// Functions/variables: camelCase
const myFunction = () => { ... }
const myVariable = 'value'

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3

// Files: kebab-case for utilities, PascalCase for components
my-utility.ts
MyComponent.tsx
```

## Project Structure

Keep the project organized:

```
src/
 components/           # React components
    ui/              # Shadcn UI components
    custom/          # Custom components
 hooks/               # Custom hooks
 lib/                 # Utilities
 pages/               # Page components
 types/               # TypeScript types
 utils/               # Helper functions
 test/                # Tests
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for exported functions
- Document new environment variables in .env.example
- Keep API documentation up to date

## Questions?

- Check existing issues and discussions
- Open a new discussion for questions
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to AV Safeguard v5!** 
