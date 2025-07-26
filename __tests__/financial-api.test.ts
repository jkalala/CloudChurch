import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '../app/api/financial/route';
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

describe('Financial API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/financial', () => {
    it('should return financial summary and transactions', async () => {
      const mockSummary = {
        totalTithes: 1000,
        totalOfferings: 500,
        totalIncome: 1500,
      };

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

      mockDatabaseService.getFinancialSummary.mockResolvedValue(mockSummary);
      mockDatabaseService.getFinancialTransactions.mockResolvedValue(mockTransactions);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.summary).toEqual(mockSummary);
      expect(data.transactions).toHaveLength(1);
      expect(data.transactions[0]).toEqual({
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
      });
    });

    it('should handle errors gracefully', async () => {
      mockDatabaseService.getFinancialSummary.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch financial data');
    });
  });

  describe('POST /api/financial', () => {
    it('should create a new transaction', async () => {
      const transactionData = {
        amount: 100,
        type: 'income',
        method: 'cash',
        date: '2024-01-01',
        description: 'Test transaction',
      };

      const mockCreatedTransaction = {
        id: '1',
        ...transactionData,
        transaction_type: transactionData.type,
        payment_method: transactionData.method,
        transaction_date: transactionData.date,
        created_by: 'demo-user-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockDatabaseService.createFinancialTransaction.mockResolvedValue(mockCreatedTransaction);

      const request = new NextRequest(
        new Request('http://localhost:3000/api/financial', {
          method: 'POST',
          body: JSON.stringify(transactionData),
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockCreatedTransaction);
      expect(mockDatabaseService.createFinancialTransaction).toHaveBeenCalledWith({
        amount: 100,
        transaction_type: 'income',
        payment_method: 'cash',
        transaction_date: '2024-01-01',
        description: 'Test transaction',
        created_by: 'demo-user-id',
      });
    });

    it('should handle creation errors', async () => {
      mockDatabaseService.createFinancialTransaction.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest(
        new Request('http://localhost:3000/api/financial', {
          method: 'POST',
          body: JSON.stringify({
            amount: 100,
            type: 'income',
            method: 'cash',
            date: '2024-01-01',
            description: 'Test transaction',
          }),
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create transaction');
    });
  });

  describe('PUT /api/financial', () => {
    it('should update an existing transaction', async () => {
      const transactionData = {
        amount: 200,
        type: 'expense',
        method: 'card',
        date: '2024-01-02',
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

      const request = new NextRequest(
        new Request('http://localhost:3000/api/financial', {
          method: 'PUT',
          body: JSON.stringify({
            id: '1',
            ...transactionData,
          }),
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUpdatedTransaction);
      expect(mockDatabaseService.updateFinancialTransaction).toHaveBeenCalledWith('1', {
        amount: 200,
        transaction_type: 'expense',
        payment_method: 'card',
        transaction_date: '2024-01-02',
        description: 'Updated transaction',
      });
    });

    it('should return 400 when transaction ID is missing', async () => {
      const request = new NextRequest(
        new Request('http://localhost:3000/api/financial', {
          method: 'PUT',
          body: JSON.stringify({
            amount: 200,
            type: 'expense',
            method: 'card',
            date: '2024-01-02',
            description: 'Updated transaction',
          }),
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Transaction ID is required');
    });

    it('should handle update errors', async () => {
      mockDatabaseService.updateFinancialTransaction.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest(
        new Request('http://localhost:3000/api/financial', {
          method: 'PUT',
          body: JSON.stringify({
            id: '1',
            amount: 200,
            type: 'expense',
            method: 'card',
            date: '2024-01-02',
            description: 'Updated transaction',
          }),
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update transaction');
    });
  });

  describe('DELETE /api/financial', () => {
    it('should delete a transaction', async () => {
      mockDatabaseService.deleteFinancialTransaction.mockResolvedValue(undefined);

      const request = new NextRequest(
        new Request('http://localhost:3000/api/financial', {
          method: 'DELETE',
          body: JSON.stringify({ id: '1' }),
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockDatabaseService.deleteFinancialTransaction).toHaveBeenCalledWith('1');
    });

    it('should return 400 when transaction ID is missing', async () => {
      const request = new NextRequest(
        new Request('http://localhost:3000/api/financial', {
          method: 'DELETE',
          body: JSON.stringify({}),
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Transaction ID is required');
    });

    it('should handle deletion errors', async () => {
      mockDatabaseService.deleteFinancialTransaction.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest(
        new Request('http://localhost:3000/api/financial', {
          method: 'DELETE',
          body: JSON.stringify({ id: '1' }),
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete transaction');
    });
  });
}); 