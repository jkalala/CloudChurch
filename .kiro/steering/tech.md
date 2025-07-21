# Technical Stack & Build System

## Core Technologies
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React 18
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Hooks
- **Form Handling**: React Hook Form with Zod validation
- **AI Integration**: OpenAI SDK

## Key Libraries
- **UI Components**: Radix UI primitives with shadcn/ui
- **Data Visualization**: Chart.js, Recharts
- **Date Handling**: date-fns
- **File Operations**: file-saver, xlsx, papaparse
- **Drag and Drop**: @dnd-kit
- **Offline Support**: Custom implementation with local storage
- **Theming**: next-themes
- **Notifications**: sonner, react-toast

## Testing
- **Framework**: Jest
- **Libraries**: @testing-library/react, @testing-library/jest-dom

## PWA Support
- Service Worker implementation
- Manifest configuration
- Offline capabilities

## Common Commands

### Development
```bash
# Start development server
pnpm dev

# Run linting
pnpm lint

# Build for production
pnpm build

# Start production server
pnpm start
```

### Database
```bash
# Setup complete database (from scripts folder)
psql -f setup-complete-database.sql

# Apply specific migration (from scripts folder)
psql -f v{number}-{description}.sql
```

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side only)
- `OPENAI_API_KEY`: OpenAI API key for AI features