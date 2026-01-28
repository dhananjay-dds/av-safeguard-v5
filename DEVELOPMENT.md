# Development Guide

This guide provides detailed information for developers working on AV Safeguard v5.

## Table of Contents

- [Development Environment](#development-environment)
- [Project Architecture](#project-architecture)
- [Development Workflow](#development-workflow)
- [Debugging](#debugging)
- [Performance Tips](#performance-tips)
- [Common Tasks](#common-tasks)

## Development Environment

### System Requirements

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Git 2.0.0 or higher

### IDE Setup

#### VS Code (Recommended)

Recommended extensions:

- ESLint
- Prettier - Code formatter
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Thunder Client (for API testing)

#### WebStorm

- All tools are built-in
- Enable ESLint and Prettier support in settings

### Setting Up Your Environment

```bash
# 1. Clone the repository
git clone https://github.com/dhananjay-dds/av-safeguard-v5.git
cd av-safeguard-v5

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Start development server
npm run dev
```

## Project Architecture

### Directory Structure

```
src/
 components/
    ui/                    # Shadcn UI components
    CertificationBadge.tsx # Domain-specific components
    NavLink.tsx
    ResultsGrid.tsx
    RoomModeAnalysis.tsx
    RowManager.tsx
 hooks/
    use-mobile.tsx         # Responsive design hook
    use-toast.ts           # Toast notification hook
 lib/
    utils.ts               # Utility functions (cn, etc.)
 pages/
    Index.tsx              # Home page
    NotFound.tsx           # 404 page
 types/
    avTypes.ts             # TypeScript type definitions
 utils/
    calculations.ts        # Business logic
    pdfGenerator.ts        # PDF generation
 test/
    setup.ts               # Test configuration
    example.test.ts        # Test examples
 App.tsx                    # Root component
 App.css                    # Global styles
 main.tsx                   # Vite entry point
 index.css                  # Base styles
 vite-env.d.ts             # Vite type definitions
```

### Key Technologies

- **React 18** - UI library with hooks
- **TypeScript** - Type safety
- **Vite** - Build tool with HMR
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Component library built on Radix UI
- **React Hook Form** - Form state management
- **React Query** - Server state management
- **Vitest** - Unit testing framework
- **Playwright** - E2E testing

## Development Workflow

### Starting Development

```bash
npm run dev
```

- Dev server runs on `http://localhost:5173`
- Hot Module Replacement (HMR) is enabled
- Source maps are available for debugging
- ESLint and TypeScript checking on save

### Available Scripts

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run build:dev        # Development build
npm run preview          # Preview production build
npm run lint             # Check code with ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run type-check       # Check TypeScript types
npm test                 # Run unit tests
npm run test:watch       # Watch mode for tests
```

### Creating a New Component

```typescript
// src/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  children?: React.ReactNode;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  children,
}) => {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
};
```

### Creating a Custom Hook

```typescript
// src/hooks/useMyHook.ts
import { useState, useCallback } from 'react';

export const useMyHook = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return { value, setValue, reset };
};
```

### Creating Utility Functions

```typescript
// src/utils/myUtil.ts
export const myUtil = (input: string): string => {
  return input.toUpperCase();
};

export const anotherUtil = (a: number, b: number): number => {
  return a + b;
};
```

## Debugging

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}",
      "sourceMaps": true
    }
  ]
}
```

### Browser DevTools

- Right-click  Inspect to open DevTools
- React Developer Tools extension available
- Redux DevTools (if Redux used)

### Console Debugging

```typescript
// Basic logging
console.log('Value:', value);

// Structured logging
console.table(data);
console.group('Group name');
console.log('Item 1');
console.log('Item 2');
console.groupEnd();

// Warnings and errors
console.warn('Warning message');
console.error('Error message');
```

### TypeScript Debugging

```typescript
// Hover over variables to see types
const value = someFunction(); // Ctrl+K Ctrl+I for type info

// Use 'satisfies' operator
const config = { /* ... */ } satisfies Config;

// Explicit types when needed
const value: MyType = getData();
```

## Performance Tips

### React Performance

```typescript
// Use React.memo for expensive components
export const MyComponent = React.memo(({ title }: Props) => {
  return <div>{title}</div>;
});

// Use useCallback for stable function references
const handleClick = useCallback(() => {
  doSomething();
}, []);

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return calculateSomething(data);
}, [data]);
```

### Build Optimization

```bash
# Analyze bundle size
npm run build -- --mode analyze

# Check for unused dependencies
npm ls --depth=0
```

### Assets

- Optimize images before committing
- Use WebP format when possible
- Lazy load components when possible

```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## Common Tasks

### Adding a New Page

```typescript
// src/pages/NewPage.tsx
export function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
      {/* Content here */}
    </div>
  );
}
```

Update routing in App.tsx to include the new page.

### Styling Components

```typescript
// Using Tailwind CSS
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <span className="text-lg font-semibold">Title</span>
</div>

// Using CSS modules
import styles from './MyComponent.module.css';

<div className={styles.container}>
  {/* Content */}
</div>

// Using CSS-in-JS with tailwind-merge
import { cn } from '@/lib/utils';

<div className={cn('base-classes', isActive && 'active-classes')}>
  {/* Content */}
</div>
```

### Working with Forms

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      {/* More fields */}
    </form>
  );
}
```

### Fetching Data

```typescript
import { useQuery } from '@tanstack/react-query';

export function UserList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Writing Tests

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders the title', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [Vitest Docs](https://vitest.dev/)

---

**Happy coding!** 
