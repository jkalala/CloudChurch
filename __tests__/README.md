# Financial Module Tests

This directory contains comprehensive unit tests for the financial module of the CloudChurch application.

## Test Structure

### API Tests
- **`financial-api.test.ts`** - Tests for the main financial API routes (`/api/financial`)
- **`financial-expenses-api.test.ts`** - Tests for the expenses API routes (`/api/financial/expenses`)

### Database Tests
- **`financial-database.test.ts`** - Tests for the database service methods

### Frontend Tests
- **`financial-page.test.tsx`** - Tests for the financial page component

### Utility Tests
- **`financial-utils.test.ts`** - Tests for utility functions and data transformations

### Test Runner
- **`financial-test-runner.ts`** - Centralized test runner with reporting

## Running Tests

### Run All Financial Tests
```bash
npm test __tests__/financial
```

### Run Specific Test File
```bash
npm test __tests__/financial-api.test.ts
```

### Run with Coverage
```bash
npm test __tests__/financial -- --coverage
```

### Run Test Runner
```bash
npx ts-node __tests__/financial-test-runner.ts
```

## Test Coverage

### API Layer Coverage
- ✅ GET `/api/financial` - Fetch financial summary and transactions
- ✅ POST `/api/financial` - Create new transaction
- ✅ PUT `/api/financial` - Update existing transaction
- ✅ DELETE `/api/financial` - Delete transaction
- ✅ GET `/api/financial/expenses` - Fetch all expenses
- ✅ POST `/api/financial/expenses` - Create new expense
- ✅ PUT `/api/financial/expenses` - Update existing expense
- ✅ DELETE `/api/financial/expenses` - Delete expense
- ✅ Error handling for all endpoints
- ✅ Data validation and transformation

### Database Layer Coverage
- ✅ `getFinancialTransactions()` - Fetch transactions with member data
- ✅ `createFinancialTransaction()` - Create new transaction
- ✅ `updateFinancialTransaction()` - Update existing transaction
- ✅ `deleteFinancialTransaction()` - Delete transaction
- ✅ `getExpenses()` - Fetch all expenses
- ✅ `createExpense()` - Create new expense
- ✅ `updateExpense()` - Update existing expense
- ✅ `deleteExpense()` - Delete expense
- ✅ Error handling and edge cases
- ✅ Data integrity validation

### Frontend Layer Coverage
- ✅ Financial page rendering
- ✅ Modal interactions (open/close)
- ✅ Form handling and validation
- ✅ Data fetching and state management
- ✅ User interactions (search, filter, export)
- ✅ Transaction form submission
- ✅ Expense form submission
- ✅ Error state handling
- ✅ Loading state handling

### Utility Coverage
- ✅ Currency formatting
- ✅ Data transformation (frontend ↔ database)
- ✅ Financial calculations (income, expenses, balance)
- ✅ Data validation
- ✅ Date handling and validation

## Test Patterns

### Mocking Strategy
- **API Tests**: Mock the database service to isolate API logic
- **Database Tests**: Mock Supabase client to test database operations
- **Frontend Tests**: Mock fetch API and UI components
- **Utility Tests**: Test pure functions without mocking

### Test Data
- Consistent test data across all test files
- Realistic financial scenarios
- Edge cases and error conditions
- Proper TypeScript typing

### Assertions
- HTTP status codes for API tests
- Data structure validation
- Error message verification
- Component rendering verification
- User interaction simulation

## Best Practices

### Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Clean up after each test

### Error Handling
- Test both success and failure scenarios
- Verify error messages and status codes
- Test edge cases and invalid inputs
- Ensure graceful degradation

### Performance
- Mock external dependencies
- Use fast, isolated tests
- Avoid real network calls
- Minimize test setup time

## Continuous Integration

### GitHub Actions
```yaml
- name: Run Financial Tests
  run: npm test __tests__/financial
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test __tests__/financial"
    }
  }
}
```

## Debugging Tests

### Running Individual Tests
```bash
npm test -- --testNamePattern="should create a new transaction"
```

### Debug Mode
```bash
npm test __tests__/financial-api.test.ts -- --verbose
```

### Coverage Report
```bash
npm test __tests__/financial -- --coverage --coverageReporters=text
```

## Test Maintenance

### Adding New Tests
1. Create test file in `__tests__/` directory
2. Follow existing naming conventions
3. Add to test runner if needed
4. Update this README

### Updating Tests
1. Update tests when API changes
2. Maintain backward compatibility
3. Update test data as needed
4. Verify all tests still pass

### Test Data Management
- Keep test data realistic
- Use consistent IDs and values
- Document any special test scenarios
- Update when business logic changes

## Reporting

The test runner generates a comprehensive report including:
- Test execution summary
- Success/failure rates
- Performance metrics
- Coverage analysis
- Recommendations for improvement

## Troubleshooting

### Common Issues
1. **Mock not working**: Check import paths and mock setup
2. **Async test failures**: Ensure proper `await` usage
3. **Component not rendering**: Check mock implementations
4. **Type errors**: Verify TypeScript interfaces

### Debug Commands
```bash
# Run with debug output
npm test -- --verbose

# Run specific test with debug
npm test -- --testNamePattern="specific test name"

# Check test environment
npm test -- --detectOpenHandles
```

## Contributing

When adding new financial features:
1. Write tests first (TDD approach)
2. Ensure all existing tests pass
3. Add integration tests for complex scenarios
4. Update documentation as needed
5. Run the full test suite before committing

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html) 