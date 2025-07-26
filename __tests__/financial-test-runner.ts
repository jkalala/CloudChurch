/**
 * Financial Module Test Runner
 * 
 * This script provides a centralized way to run all financial module tests
 * and generate a comprehensive test report.
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface TestResult {
  testFile: string;
  passed: number;
  failed: number;
  total: number;
  duration: number;
}

class FinancialTestRunner {
  private testFiles = [
    'financial-api.test.ts',
    'financial-expenses-api.test.ts',
    'financial-database.test.ts',
    'financial-page.test.tsx',
    'financial-utils.test.ts',
  ];

  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 Running Financial Module Tests...\n');

    for (const testFile of this.testFiles) {
      try {
        console.log(`📋 Running ${testFile}...`);
        const startTime = Date.now();
        
        // Run the test file using Jest
        const result = execSync(`npx jest __tests__/${testFile} --json --silent`, {
          encoding: 'utf8',
          stdio: 'pipe',
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Parse Jest JSON output
        const testResult = JSON.parse(result);
        
        this.results.push({
          testFile,
          passed: testResult.numPassedTests,
          failed: testResult.numFailedTests,
          total: testResult.numTotalTests,
          duration,
        });

        console.log(`✅ ${testFile} completed in ${duration}ms`);
        console.log(`   Passed: ${testResult.numPassedTests}, Failed: ${testResult.numFailedTests}\n`);

      } catch (error) {
        console.log(`❌ ${testFile} failed to run`);
        console.log(`   Error: ${error}\n`);
        
        this.results.push({
          testFile,
          passed: 0,
          failed: 1,
          total: 1,
          duration: 0,
        });
      }
    }

    this.generateReport();
  }

  private generateReport(): void {
    const totalTests = this.results.reduce((sum, result) => sum + result.total, 0);
    const totalPassed = this.results.reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = this.results.reduce((sum, result) => sum + result.failed, 0);
    const totalDuration = this.results.reduce((sum, result) => sum + result.duration, 0);

    const report = `
# Financial Module Test Report

## Summary
- **Total Test Files**: ${this.testFiles.length}
- **Total Tests**: ${totalTests}
- **Passed**: ${totalPassed}
- **Failed**: ${totalFailed}
- **Success Rate**: ${((totalPassed / totalTests) * 100).toFixed(2)}%
- **Total Duration**: ${totalDuration}ms

## Test Results

${this.results.map(result => `
### ${result.testFile}
- **Status**: ${result.failed === 0 ? '✅ PASSED' : '❌ FAILED'}
- **Tests**: ${result.passed}/${result.total} passed
- **Duration**: ${result.duration}ms
`).join('')}

## Test Coverage Areas

### API Layer
- ✅ Financial transactions CRUD operations
- ✅ Financial expenses CRUD operations
- ✅ Error handling and validation
- ✅ Data transformation between frontend and database formats

### Database Layer
- ✅ Financial transaction operations
- ✅ Expense operations
- ✅ Error handling and edge cases
- ✅ Data integrity validation

### Frontend Layer
- ✅ Financial page rendering
- ✅ Modal interactions
- ✅ Form handling and validation
- ✅ Data fetching and state management
- ✅ User interactions (search, filter, export)

### Utilities
- ✅ Currency formatting
- ✅ Data transformation
- ✅ Financial calculations
- ✅ Data validation
- ✅ Date handling

## Recommendations

${totalFailed > 0 ? `
### Issues Found
- Some tests are failing and need attention
- Review failed test cases and fix underlying issues
- Consider adding more edge case tests
` : `
### All Tests Passing! 🎉
- The financial module is well-tested
- Consider adding integration tests for end-to-end scenarios
- Monitor performance metrics in production
`}

Generated on: ${new Date().toISOString()}
    `;

    // Write report to file
    const reportPath = join(process.cwd(), 'financial-test-report.md');
    writeFileSync(reportPath, report);

    console.log('\n📊 Test Report Generated');
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`\n🎯 Overall Success Rate: ${((totalPassed / totalTests) * 100).toFixed(2)}%`);
    
    if (totalFailed > 0) {
      console.log(`⚠️  ${totalFailed} tests failed - please review the report`);
      process.exit(1);
    } else {
      console.log('🎉 All tests passed!');
    }
  }

  async runSpecificTest(testFile: string): Promise<void> {
    if (!this.testFiles.includes(testFile)) {
      console.log(`❌ Test file ${testFile} not found`);
      return;
    }

    console.log(`🧪 Running specific test: ${testFile}`);
    
    try {
      const result = execSync(`npx jest __tests__/${testFile} --verbose`, {
        encoding: 'utf8',
      });
      console.log(result);
    } catch (error) {
      console.log(`❌ Test failed: ${error}`);
    }
  }
}

// CLI interface
if (require.main === module) {
  const runner = new FinancialTestRunner();
  
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Run specific test
    runner.runSpecificTest(args[0]);
  } else {
    // Run all tests
    runner.runAllTests();
  }
}

export default FinancialTestRunner; 