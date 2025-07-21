# Project Structure

## Directory Organization

### Root Level
- `app/`: Next.js App Router pages and components
- `components/`: Shared UI components
- `docs/`: Documentation files
- `hooks/`: Custom React hooks
- `lib/`: Utility functions and services
- `public/`: Static assets
- `scripts/`: Database scripts and utilities
- `styles/`: Global CSS styles
- `__tests__/`: Test files

### App Directory (Next.js App Router)
- `app/api/`: API routes
- `app/auth/`: Authentication pages
- `app/dashboard/`: Dashboard pages
- `app/components/`: App-specific components
- `app/[feature]/`: Feature-specific pages (bible-study, live-streaming, etc.)
- `app/page.tsx`: Home page
- `app/layout.tsx`: Root layout with providers

### Library Structure
- `lib/actions.ts`: Server actions
- `lib/database.ts`: Database utilities
- `lib/supabase-*.ts`: Supabase client configurations
- `lib/ai-*.ts`: AI service implementations
- `lib/*-service.ts`: Feature-specific services

### Component Organization
- `components/ui/`: Reusable UI components (shadcn/ui)
- `components/auth-provider.tsx`: Authentication context provider
- `components/theme-provider.tsx`: Theme context provider

## Naming Conventions
- **Files**: kebab-case for most files
- **Components**: PascalCase for component files and functions
- **Hooks**: camelCase with 'use' prefix
- **Services**: camelCase with '-service' suffix
- **Database Scripts**: v{number}-{description}.sql for migrations

## Code Organization Patterns
- Server Components vs. Client Components
  - Use 'use client' directive for client components
  - Keep server components as the default
- Feature-based organization within app directory
- Shared utilities in lib directory
- Custom hooks in hooks directory
- UI components in components/ui

## Special Files
- `app/layout.tsx`: Root layout with providers
- `app/page.tsx`: Home page
- `next.config.mjs`: Next.js configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `package.json`: Dependencies and scripts