const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
};

jest.mock('@/lib/supabase-client', () => ({
  supabase: mockSupabase,
}));

import { DatabaseService } from '../lib/database';
import { supabase } from '@/lib/supabase-client';

describe('Financial Database Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFinancialTransactions', () => {
    it('should fetch financial transactions with member data', async () => {
      const mockTransactions = [
        {
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
        },
      ];

      mockSupabase.single.mockResolvedValue({
        data: mockTransactions,
        error: null,
      });

      const result = await DatabaseService.getFinancialTransactions();

      expect(mockSupabase.from).toHaveBeenCalledWith('financial_transactions');
      expect(mockSupabase.select).toHaveBeenCalledWith(`
            *,
            members (
              first_name,
              last_name
            )
          `);
      expect(mockSupabase.order).toHaveBeenCalledWith('transaction_date', { ascending: false });
      expect(result).toEqual(mockTransactions);
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await DatabaseService.getFinancialTransactions();

      expect(result).toEqual([]);
    });
  });

  describe('createFinancialTransaction', () => {
    it('should create a new financial transaction', async () => {
      const transactionData = {
        amount: 100,
        transaction_type: 'income',
        payment_method: 'cash',
        transaction_date: '2024-01-01',
        description: 'Test transaction',
        created_by: 'demo-user-id',
      };

      const mockCreatedTransaction = {
        id: '1',
        ...transactionData,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockCreatedTransaction,
        error: null,
      });

      const result = await DatabaseService.createFinancialTransaction(transactionData);

      expect(mockSupabase.from).toHaveBeenCalledWith('financial_transactions');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        ...transactionData,
        created_by: 'demo-user-id',
      });
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedTransaction);
    });

    it('should throw error when creation fails', async () => {
      const transactionData = {
        amount: 100,
        transaction_type: 'income',
        payment_method: 'cash',
        transaction_date: '2024-01-01',
        description: 'Test transaction',
      };

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(DatabaseService.createFinancialTransaction(transactionData))
        .rejects.toThrow();
    });
  });

  describe('updateFinancialTransaction', () => {
    it('should update an existing financial transaction', async () => {
      const transactionData = {
        amount: 200,
        transaction_type: 'expense',
        payment_method: 'card',
        transaction_date: '2024-01-02',
        description: 'Updated transaction',
      };

      const mockUpdatedTransaction = {
        id: '1',
        amount: 200,
        transaction_type: 'expense',
        payment_method: 'card',
        transaction_date: '2024-01-02',
        description: 'Updated transaction',
        created_by: 'demo-user-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUpdatedTransaction,
        error: null,
      });

      const result = await DatabaseService.updateFinancialTransaction('1', transactionData);

      expect(mockSupabase.from).toHaveBeenCalledWith('financial_transactions');
      expect(mockSupabase.update).toHaveBeenCalledWith({
        ...transactionData,
        updated_at: expect.any(String),
      });
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(mockUpdatedTransaction);
    });

    it('should throw error when update fails', async () => {
      const transactionData = {
        amount: 200,
        transaction_type: 'expense',
        payment_method: 'card',
        transaction_date: '2024-01-02',
        description: 'Updated transaction',
      };

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(DatabaseService.updateFinancialTransaction('1', transactionData))
        .rejects.toThrow();
    });
  });

  describe('deleteFinancialTransaction', () => {
    it('should delete a financial transaction', async () => {
      mockSupabase.delete.mockResolvedValue({
        error: null,
      });

      await DatabaseService.deleteFinancialTransaction('1');

      expect(mockSupabase.from).toHaveBeenCalledWith('financial_transactions');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
    });

    it('should throw error when deletion fails', async () => {
      mockSupabase.delete.mockResolvedValue({
        error: { message: 'Database error' },
      });

      await expect(DatabaseService.deleteFinancialTransaction('1'))
        .rejects.toThrow();
    });
  });

  describe('getExpenses', () => {
    it('should fetch all expenses', async () => {
      const mockExpenses = [
        {
          id: '1',
          budget_id: 'budget-1',
          category_id: 'category-1',
          amount: 100,
          description: 'Test expense',
          date: '2024-01-01',
          payment_method: 'card',
          status: 'approved',
          created_by: 'user-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockSupabase.single.mockResolvedValue({
        data: mockExpenses,
        error: null,
      });

      const result = await DatabaseService.getExpenses();

      expect(mockSupabase.from).toHaveBeenCalledWith('expenses');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.order).toHaveBeenCalledWith('date', { ascending: false });
      expect(result).toEqual(mockExpenses);
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await DatabaseService.getExpenses();

      expect(result).toEqual([]);
    });
  });

  describe('createExpense', () => {
    it('should create a new expense', async () => {
      const expenseData = {
        budget_id: 'budget-1',
        category_id: 'category-1',
        amount: 100,
        description: 'Test expense',
        date: '2024-01-01',
        payment_method: 'card',
        status: 'pending' as const,
        created_by: 'demo-user-id',
      };

      const mockCreatedExpense = {
        id: '1',
        ...expenseData,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockCreatedExpense,
        error: null,
      });

      const result = await DatabaseService.createExpense(expenseData);

      expect(mockSupabase.from).toHaveBeenCalledWith('expenses');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        ...expenseData,
        created_at: expect.any(String),
      });
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedExpense);
    });

    it('should throw error when creation fails', async () => {
      const expenseData = {
        budget_id: 'budget-1',
        amount: 100,
        description: 'Test expense',
        date: '2024-01-01',
        payment_method: 'card',
      };

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(DatabaseService.createExpense(expenseData))
        .rejects.toThrow();
    });
  });

  describe('updateExpense', () => {
    it('should update an existing expense', async () => {
      const expenseData = {
        amount: 200,
        description: 'Updated expense',
        payment_method: 'cash',
        status: 'approved' as const,
      };

      const mockUpdatedExpense = {
        id: '1',
        budget_id: 'budget-1',
        category_id: 'category-1',
        amount: 200,
        description: 'Updated expense',
        date: '2024-01-01',
        payment_method: 'cash',
        status: 'approved',
        created_by: 'demo-user-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUpdatedExpense,
        error: null,
      });

      const result = await DatabaseService.updateExpense('1', expenseData);

      expect(mockSupabase.from).toHaveBeenCalledWith('expenses');
      expect(mockSupabase.update).toHaveBeenCalledWith({
        ...expenseData,
        updated_at: expect.any(String),
      });
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(mockUpdatedExpense);
    });

    it('should throw error when update fails', async () => {
      const expenseData = {
        amount: 200,
        description: 'Updated expense',
      };

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(DatabaseService.updateExpense('1', expenseData))
        .rejects.toThrow();
    });
  });

  describe('deleteExpense', () => {
    it('should delete an expense', async () => {
      mockSupabase.delete.mockResolvedValue({
        error: null,
      });

      await DatabaseService.deleteExpense('1');

      expect(mockSupabase.from).toHaveBeenCalledWith('expenses');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
    });

    it('should throw error when deletion fails', async () => {
      mockSupabase.delete.mockResolvedValue({
        error: { message: 'Database error' },
      });

      await expect(DatabaseService.deleteExpense('1'))
        .rejects.toThrow();
    });
  });
}); 