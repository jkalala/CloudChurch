# CloudChurch CI/CD Pipeline

This document describes the comprehensive CI/CD pipeline implemented for the CloudChurch project.

## 🚀 Pipeline Overview

The CI/CD pipeline is built using GitHub Actions and includes the following stages:

### 1. **Lint and Type Check**

- ESLint code quality checks
- TypeScript type checking
- Prettier formatting validation

### 2. **Test Suite**

- Jest unit tests with coverage reporting
- Multiple Node.js version testing (16, 18, 20)
- Code coverage upload to Codecov

### 3. **Build**

- Next.js application build
- Build artifact storage
- Dependency on lint and test success

### 4. **Security Scan**

- npm audit for vulnerability checks
- Snyk security scanning
- Moderate and high severity checks

### 5. **Database Migration Check**

- SQL script syntax validation
- Database migration verification

### 6. **Deployment**

- **Staging**: Automatic deployment on `develop` branch
- **Production**: Automatic deployment on `main` branch
- Vercel deployment integration

### 7. **Notifications**

- Slack notifications for deployment status
- Discord webhook integration
- Success/failure alerts

## 🔧 Setup Instructions

### 1. **GitHub Secrets Configuration**

Add the following secrets to your GitHub repository:

```bash
# Vercel Deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# Security Scanning
SNYK_TOKEN=your_snyk_token

# Notifications
SLACK_WEBHOOK=your_slack_webhook_url
DISCORD_WEBHOOK=your_discord_webhook_url

# Database (if using external database)
DATABASE_URL=your_database_url
SUPABASE_ACCESS_TOKEN=your_supabase_token
```

### 2. **Environment Setup**

Create environment files for different stages:

```bash
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# .env.staging
NEXT_PUBLIC_SUPABASE_URL=your_staging_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_staging_supabase_anon_key

# .env.production
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

### 3. **Local Development Setup**

```bash
# Install dependencies
pnpm install

# Setup git hooks
pnpm prepare

# Run development server
pnpm dev

# Run tests
pnpm test

# Run linting
pnpm lint

# Run type checking
pnpm type-check

# Format code
pnpm format
```

## 📋 Available Scripts

### Development

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
```

### Testing

```bash
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode
pnpm test:coverage # Run tests with coverage
pnpm test:ci      # Run tests for CI environment
```

### Code Quality

```bash
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript type check
pnpm format       # Format code with Prettier
pnpm format:check # Check code formatting
```

### Security

```bash
pnpm audit        # Run security audit
pnpm audit:fix    # Fix security vulnerabilities
```

### Database

```bash
pnpm db:migrate   # Run database migrations
pnpm db:reset     # Reset database
pnpm db:seed      # Seed database with sample data
```

## 🔄 Workflow Triggers

The pipeline is triggered on:

- **Push** to `main` or `develop` branches
- **Pull Request** to `main` or `develop` branches

## 📊 Quality Gates

### Test Coverage Requirements

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Security Requirements

- No high severity vulnerabilities
- No moderate severity vulnerabilities in production
- All dependencies must be up to date

### Code Quality Requirements

- All ESLint rules must pass
- TypeScript compilation must succeed
- Prettier formatting must be consistent

## 🚀 Deployment Strategy

### Staging Environment

- **Branch**: `develop`
- **Trigger**: Push to develop branch
- **Purpose**: Testing and validation
- **URL**: `https://cloudchurch-staging.vercel.app`

### Production Environment

- **Branch**: `main`
- **Trigger**: Push to main branch
- **Purpose**: Live application
- **URL**: `https://cloudchurch.vercel.app`

## 📈 Monitoring and Alerts

### Success Notifications

- Slack channel: `#deployments`
- Discord webhook integration
- Email notifications (configurable)

### Failure Alerts

- Immediate notification on pipeline failure
- Detailed error logs
- Rollback procedures

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**

   ```bash
   # Check for TypeScript errors
   pnpm type-check

   # Check for linting errors
   pnpm lint
   ```

2. **Test Failures**

   ```bash
   # Run tests locally
   pnpm test

   # Check test coverage
   pnpm test:coverage
   ```

3. **Deployment Failures**
   - Check Vercel configuration
   - Verify environment variables
   - Check build logs

### Debug Commands

```bash
# Check git hooks
ls -la .husky/

# Run lint-staged manually
npx lint-staged

# Check commit format
npx commitlint --edit .git/COMMIT_EDITMSG
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)

## 🤝 Contributing

When contributing to this project:

1. **Create a feature branch** from `develop`
2. **Write tests** for new functionality
3. **Follow the commit convention** (feat:, fix:, etc.)
4. **Ensure all checks pass** before creating a PR
5. **Request review** from team members

## 📞 Support

For CI/CD related issues:

1. Check the GitHub Actions logs
2. Review the troubleshooting section
3. Contact the development team
4. Create an issue in the repository

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: Development Team
