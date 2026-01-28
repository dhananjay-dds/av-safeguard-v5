# AV Safeguard v5

**A modern React application for audio-visual acoustic analysis and safeguarding.** Built with cutting-edge technologies for high performance and scalability.

![TypeScript](https://img.shields.io/badge/TypeScript-97.6%25-blue)
![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-Latest-purple)
![License](https://img.shields.io/badge/License-MIT-green)

** Live Demo:** [av-safeguard-v5.vercel.app](https://av-safeguard-v5.vercel.app/)

---

##  Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Development](#-development)
- [Building & Deployment](#-building--deployment)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

##  Features

- ** Lightning-Fast Development** - Powered by Vite for instant HMR
- ** Beautiful UI Components** - Shadcn UI with Tailwind CSS
- ** State Management** - TanStack React Query for server state
- ** Form Handling** - React Hook Form with Zod validation
- ** Responsive Design** - Mobile-first approach with Tailwind CSS
- ** Testing Ready** - Vitest + Playwright configured
- ** Type Safe** - Full TypeScript support
- ** ESLint & Quality Tools** - Code quality out of the box
- ** Production Optimized** - Vercel deployment ready

---

##  Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend Framework** | React 18+ |
| **Language** | TypeScript 5+ |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + PostCSS |
| **Component Library** | Shadcn UI |
| **Form Management** | React Hook Form |
| **Form Validation** | Zod |
| **State Management** | TanStack React Query |
| **Date Handling** | date-fns |
| **Carousel** | Embla Carousel |
| **Command Palette** | cmdk |
| **Unit Testing** | Vitest |
| **E2E Testing** | Playwright |
| **Linting** | ESLint |
| **Code Formatting** | Prettier (optional) |
| **Git Hooks** | Husky + lint-staged |
| **Deployment** | Vercel |

---

##  Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** - v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** - v9.0.0 or higher (comes with Node.js)
- **Git** - v2.0.0 or higher ([Download](https://git-scm.com/))

**Verify Installation:**
```bash
node --version    # Should be v18+
npm --version     # Should be v9+
git --version     # Should be v2+
```

---

##  Installation

### 1. Clone the Repository

```bash
git clone https://github.com/dhananjay-dds/av-safeguard-v5.git
cd av-safeguard-v5
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env.local
```

### 4. Verify Installation

```bash
npm run lint
npm test
```

---

##  Development

### Start Development Server

```bash
npm run dev
```

Available at `http://localhost:5173`

### Available Commands

```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm run build:dev    # Build for development
npm run lint         # Run ESLint
npm run preview      # Preview production build
npm test             # Run tests
npm run test:watch   # Watch mode
```

---

##  Building & Deployment

### Build for Production

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

### Deploy to Vercel

```bash
git push origin main
```

---

##  Testing

```bash
npm test                 # Run tests once
npm run test:watch      # Watch mode
```

---

##  Project Structure

```
src/
 components/        # React components
    ui/           # Shadcn UI components
    *.tsx         # Custom components
 hooks/            # Custom React hooks
 lib/              # Utilities
 pages/            # Page components
 types/            # TypeScript types
 utils/            # Helper functions
 test/             # Tests
 App.tsx          # Root component
```

---

##  Contributing

1. Fork the repository
2. Create a feature branch: \git checkout -b feature/your-feature\
3. Commit changes: \git commit -m "feat: add feature"\
4. Push to branch: \git push origin feature/your-feature\
5. Create Pull Request

---

##  License

MIT License - see LICENSE file for details.

---

##  Contributors

- [@dhananjay-dds](https://github.com/dhananjay-dds)
- [@sawantadhananjay-arch](https://github.com/sawantadhananjay-arch)

---

**Made with  by the AV Safeguard Team**

