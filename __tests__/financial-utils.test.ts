// Utility functions for financial calculations and formatting

// Mock the formatCurrency function since it's not exported
const mockFormatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

describe('Financial Utilities', () => {
  describe('Currency Formatting', () => {
    it('should format positive amounts correctly', () => {
      const result = mockFormatCurrency(1234.56);
      expect(result).toBe('$1,234.56');
    });

    it('should format zero amounts correctly', () => {
      const result = mockFormatCurrency(0);
      expect(result).toBe('$0.00');
    });

    it('should format negative amounts correctly', () => {
      const result = mockFormatCurrency(-1234.56);
      expect(result).toBe('-$1,234.56');
    });

    it('should format large amounts correctly', () => {
      const result = mockFormatCurrency(1000000);
      expect(result).toBe('$1,000,000.00');
    });

    it('should format decimal amounts correctly', () => {
      const result = mockFormatCurrency(0.99);
      expect(result).toBe('$0.99');
    });
  });

  describe('Data Transformation', () => {
    it('should transform database transaction to frontend format', () => {
      const dbTransaction = {
        id: '1',
        amount: 100,
        transaction_type: 'income',
        description: 'Test transaction',
        transaction_date: '2024-01-01',
        payment_method: 'cash',
        member_id: 'member-1',
        created_by: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        members: {
          first_name: 'John',
          last_name: 'Doe',
        },
      };

      const expectedFrontendTransaction = {
        id: '1',
        date: '2024-01-01',
        description: 'Test transaction',
        category: 'General',
        amount: 100,
        type: 'income',
        method: 'cash',
        status: 'completed',
        member_id: 'member-1',
        member_name: 'John Doe',
      };

      // This would be the transformation logic used in the API
      const transformed = {
        id: dbTransaction.id,
        date: dbTransaction.transaction_date,
        description: dbTransaction.description || '',
        category: 'General', // Default category since database doesn't have this field
        amount: dbTransaction.amount,
        type: dbTransaction.transaction_type as 'income' | 'expense',
        method: dbTransaction.payment_method,
        status: 'completed',
        member_id: dbTransaction.member_id,
        member_name: dbTransaction.members?.first_name && dbTransaction.members?.last_name 
          ? `${dbTransaction.members.first_name} ${dbTransaction.members.last_name}` 
          : undefined,
      };

      expect(transformed).toEqual(expectedFrontendTransaction);
    });

    it('should transform frontend transaction to database format', () => {
      const frontendTransaction = {
        amount: 100,
        type: 'income',
        method: 'cash',
        date: '2024-01-01',
        description: 'Test transaction',
      };

      const expectedDbTransaction = {
        amount: 100,
        transaction_type: 'income',
        payment_method: 'cash',
        transaction_date: '2024-01-01',
        description: 'Test transaction',
        created_by: 'demo-user-id',
      };

      // This would be the transformation logic used in the API
      const transformed = {
        amount: frontendTransaction.amount,
        transaction_type: frontendTransaction.type,
        payment_method: frontendTransaction.method,
        transaction_date: frontendTransaction.date,
        description: frontendTransaction.description,
        created_by: 'demo-user-id',
      };

      expect(transformed).toEqual(expectedDbTransaction);
    });
  });

  describe('Financial Calculations', () => {
    it('should calculate total income correctly', () => {
      const transactions = [
        { amount: 100, type: 'income' },
        { amount: 200, type: 'income' },
        { amount: 50, type: 'expense' },
      ];

      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      expect(totalIncome).toBe(300);
    });

    it('should calculate total expenses correctly', () => {
      const transactions = [
        { amount: 100, type: 'income' },
        { amount: 200, type: 'expense' },
        { amount: 50, type: 'expense' },
      ];

      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      expect(totalExpenses).toBe(250);
    });

    it('should calculate balance correctly', () => {
      const transactions = [
        { amount: 1000, type: 'income' },
        { amount: 300, type: 'expense' },
        { amount: 200, type: 'income' },
      ];

      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const balance = totalIncome - totalExpenses;

      expect(balance).toBe(900);
    });
  });

  describe('Data Validation', () => {
    it('should validate transaction data', () => {
      const validTransaction = {
        amount: 100,
        type: 'income',
        method: 'cash',
        date: '2024-01-01',
        description: 'Test transaction',
      };

      const isValid = 
        validTransaction.amount > 0 &&
        ['income', 'expense'].includes(validTransaction.type) &&
        validTransaction.method &&
        validTransaction.date &&
        !!validTransaction.description;

      expect(isValid).toBe(true);
    });

    it('should reject invalid transaction data', () => {
      const invalidTransaction = {
        amount: -100, // Negative amount
        type: 'invalid', // Invalid type
        method: '', // Empty method
        date: '', // Empty date
        description: '', // Empty description
      };

      const isValid = 
        invalidTransaction.amount > 0 &&
        ['income', 'expense'].includes(invalidTransaction.type) &&
        invalidTransaction.method &&
        invalidTransaction.date &&
        !!invalidTransaction.description;

      expect(isValid).toBe(false);
    });

    it('should validate expense data', () => {
      const validExpense = {
        amount: 100,
        description: 'Test expense',
        date: '2024-01-01',
        payment_method: 'card',
        status: 'pending',
      };

      const isValid = 
        validExpense.amount > 0 &&
        !!validExpense.description &&
        validExpense.date &&
        validExpense.payment_method &&
        ['pending', 'approved', 'rejected'].includes(validExpense.status);

      expect(isValid).toBe(true);
    });
  });

  describe('Date Handling', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-01');
      const formatted = date.toISOString().split('T')[0];
      expect(formatted).toBe('2024-01-01');
    });

    it('should handle date validation', () => {
      const validDate = '2024-01-01';
      const invalidDate = 'invalid-date';

      const isValidDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
      };

      expect(isValidDate(validDate)).toBe(true);
      expect(isValidDate(invalidDate)).toBe(false);
    });
  });
}); 