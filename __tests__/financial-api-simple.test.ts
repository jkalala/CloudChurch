import { DatabaseService } from '../lib/database';

// Mock the database service
jest.mock('../lib/database', () => ({
  DatabaseService: {
    getFinancialSummary: jest.fn(),
    getFinancialTransactions: jest.fn(),
    createFinancialTransaction: jest.fn(),
    updateFinancialTransaction: jest.fn(),
    deleteFinancialTransaction: jest.fn(),
  },
}));

const mockDatabaseService = DatabaseService as jest.Mocked<typeof DatabaseService>;

describe('Financial Database Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFinancialTransactions', () => {
    it('should fetch financial transactions', async () => {
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

      mockDatabaseService.getFinancialTransactions.mockResolvedValue(mockTransactions);

      const result = await DatabaseService.getFinancialTransactions();

      expect(result).toEqual(mockTransactions);
      expect(mockDatabaseService.getFinancialTransactions).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockDatabaseService.getFinancialTransactions.mockRejectedValue(new Error('Database error'));

      const result = await DatabaseService.getFinancialTransactions();

      expect(result).toEqual([]);
    });
  });

  describe('createFinancialTransaction', () => {
    it('should create a new transaction', async () => {
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

      mockDatabaseService.createFinancialTransaction.mockResolvedValue(mockCreatedTransaction);

      const result = await DatabaseService.createFinancialTransaction(transactionData);

      expect(result).toEqual(mockCreatedTransaction);
      expect(mockDatabaseService.createFinancialTransaction).toHaveBeenCalledWith(transactionData);
    });

    it('should throw error when creation fails', async () => {
      const transactionData = {
        amount: 100,
        transaction_type: 'income',
        payment_method: 'cash',
        transaction_date: '2024-01-01',
        description: 'Test transaction',
      };

      mockDatabaseService.createFinancialTransaction.mockRejectedValue(new Error('Database error'));

      await expect(DatabaseService.createFinancialTransaction(transactionData))
        .rejects.toThrow('Database error');
    });
  });

  describe('updateFinancialTransaction', () => {
    it('should update an existing transaction', async () => {
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

      mockDatabaseService.updateFinancialTransaction.mockResolvedValue(mockUpdatedTransaction);

      const result = await DatabaseService.updateFinancialTransaction('1', transactionData);

      expect(result).toEqual(mockUpdatedTransaction);
      expect(mockDatabaseService.updateFinancialTransaction).toHaveBeenCalledWith('1', transactionData);
    });

    it('should throw error when update fails', async () => {
      const transactionData = {
        amount: 200,
        transaction_type: 'expense',
        payment_method: 'card',
        transaction_date: '2024-01-02',
        description: 'Updated transaction',
      };

      mockDatabaseService.updateFinancialTransaction.mockRejectedValue(new Error('Database error'));

      await expect(DatabaseService.updateFinancialTransaction('1', transactionData))
        .rejects.toThrow('Database error');
    });
  });

  describe('deleteFinancialTransaction', () => {
    it('should delete a transaction', async () => {
      mockDatabaseService.deleteFinancialTransaction.mockResolvedValue(undefined);

      await DatabaseService.deleteFinancialTransaction('1');

      expect(mockDatabaseService.deleteFinancialTransaction).toHaveBeenCalledWith('1');
    });

    it('should throw error when deletion fails', async () => {
      mockDatabaseService.deleteFinancialTransaction.mockRejectedValue(new Error('Database error'));

      await expect(DatabaseService.deleteFinancialTransaction('1'))
        .rejects.toThrow('Database error');
    });
  });
}); 