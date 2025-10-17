# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server (Next.js 15)
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint code linting

### Development Server
The development server runs on http://localhost:3000 by default with hot module replacement.

### Testing
This project doesn't currently have a test setup. When adding tests, consider using Jest with React Testing Library or Vitest as common Next.js testing solutions.

## Project Architecture

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Runtime**: React 19.1.0
- **Styling**: Tailwind CSS v4 with PostCSS
- **TypeScript**: Full TypeScript support with strict mode
- **Fonts**: Geist Sans and Geist Mono from next/font/google
- **Linting**: ESLint 9 with Next.js TypeScript config

### File Structure
```
src/app/                 # Next.js App Router directory
├── globals.css          # Global styles with Tailwind imports and CSS variables
├── layout.tsx           # Root layout with font configuration and metadata
└── page.tsx             # Home page component

public/                  # Static assets (SVG icons)
```

### Key Architectural Patterns
- **App Router**: Uses Next.js 15 App Router for file-based routing
- **CSS Custom Properties**: Uses CSS variables for theming with dark mode support
- **Font Optimization**: Leverages next/font/google for optimized font loading
- **Modern CSS**: Uses Tailwind CSS v4 with inline theme configuration

### Configuration Files
- `next.config.ts` - Next.js configuration (currently minimal)
- `tsconfig.json` - TypeScript configuration with path aliases (@/* → ./src/*)
- `eslint.config.mjs` - ESLint flat config with Next.js rules
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS

### Development Notes
- Path alias `@/*` is configured to reference `./src/*`
- Dark mode is implemented using CSS media queries and custom properties
- ESLint ignores build output directories (.next/, out/, build/)

### StackOverflow Clone Context
This appears to be the foundation for a StackOverflow clone application. The current implementation is a fresh Next.js setup with:
- Modern styling foundation (Tailwind CSS v4)
- TypeScript configuration
- Optimized font loading
- Dark mode support infrastructure

When extending this project, consider implementing:
- Authentication system
- Database integration
- Question/Answer data models
- Search functionality
- User profiles and reputation system