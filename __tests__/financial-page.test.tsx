import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FinancesPage from '../app/finances/page';

// Mock fetch
global.fetch = jest.fn();

// Mock the recharts components
jest.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
}));

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="card-title">{children}</div>,
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs">{children}</div>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-content">{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-trigger">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props} data-testid="button">
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} data-testid="input" />,
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
    open ? <div data-testid="dialog">{children}</div> : null
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-title">{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-footer">{children}</div>,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)} data-testid="select">
      {children}
    </select>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value} data-testid="select-item">{children}</option>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: () => <div data-testid="select-value" />,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => <label data-testid="label">{children}</label>,
}));

jest.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table data-testid="table">{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody data-testid="table-body">{children}</tbody>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td data-testid="table-cell">{children}</td>,
  TableHead: ({ children }: { children: React.ReactNode }) => <thead data-testid="table-head">{children}</thead>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <th data-testid="table-header">{children}</th>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr data-testid="table-row">{children}</tr>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span data-testid="badge">{children}</span>,
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div onClick={onClick} data-testid="dropdown-item">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-trigger">{children}</div>,
}));

describe('FinancesPage', () => {
  const mockTransactions = [
    {
      id: 'transaction-1',
      date: '2024-01-01',
      description: 'Test transaction',
      category: 'General',
      amount: 100,
      type: 'income' as const,
      method: 'cash',
      status: 'completed',
      member_id: 'member-1',
      member_name: 'John Doe',
    },
  ];

  const mockExpenses = [
    {
      id: 'expense-1',
      budget_id: 'budget-1',
      category_id: 'category-1',
      amount: 50,
      description: 'Test expense',
      date: '2024-01-01',
      payment_method: 'card',
      status: 'approved' as const,
      created_by: 'user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summary: {
            totalTithes: 1000,
            totalOfferings: 500,
            totalIncome: 1500,
          },
          transactions: mockTransactions,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockExpenses,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          budgets: [],
        }),
      });
  });

  it('should render the financial management page', async () => {
    render(<FinancesPage />);

    await waitFor(() => {
      expect(screen.getByText('Financial Management')).toBeInTheDocument();
    });
  });

  it('should display financial summary cards', async () => {
    render(<FinancesPage />);

    await waitFor(() => {
      expect(screen.getByText('Total Income')).toBeInTheDocument();
      expect(screen.getByText('Total Expenses')).toBeInTheDocument();
      expect(screen.getByText('Current Balance')).toBeInTheDocument();
    });
  });

  it('should open transaction modal when New Transaction button is clicked', async () => {
    render(<FinancesPage />);

    await waitFor(() => {
      const newTransactionButton = screen.getByText('New Transaction');
      fireEvent.click(newTransactionButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByText('New Transaction')).toBeInTheDocument();
    });
  });

  it('should open expense modal when New Expense button is clicked', async () => {
    render(<FinancesPage />);

    await waitFor(() => {
      const newExpenseButton = screen.getByText('New Expense');
      fireEvent.click(newExpenseButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });
  });

  it('should handle transaction form submission', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summary: { totalTithes: 1000, totalOfferings: 500, totalIncome: 1500 },
          transactions: mockTransactions,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          id: 'transaction-2', 
          date: '2024-01-02',
          description: 'Test transaction 2',
          category: 'General',
          amount: 200,
          type: 'income' as const,
          method: 'cash',
          status: 'completed',
          member_id: 'member-1',
          member_name: 'John Doe',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summary: { totalTithes: 1000, totalOfferings: 500, totalIncome: 1500 },
          transactions: [
            ...mockTransactions, 
            { 
              id: 'transaction-2', 
              date: '2024-01-02',
              description: 'Test transaction 2',
              category: 'General',
              amount: 200,
              type: 'income' as const,
              method: 'cash',
              status: 'completed',
              member_id: 'member-1',
              member_name: 'John Doe',
            }
          ],
        }),
      });

    render(<FinancesPage />);

    await waitFor(() => {
      const newTransactionButton = screen.getByText('New Transaction');
      fireEvent.click(newTransactionButton);
    });

    await waitFor(() => {
      const amountInput = screen.getByLabelText('Amount');
      const descriptionInput = screen.getByLabelText('Description');
      const dateInput = screen.getByLabelText('Date');

      fireEvent.change(amountInput, { target: { value: '200' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test transaction' } });
      fireEvent.change(dateInput, { target: { value: '2024-01-02' } });
    });

    await waitFor(() => {
      const saveButton = screen.getByText('Save Transaction');
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 200,
          description: 'Test transaction',
          date: '2024-01-02',
        }),
      });
    });
  });

  it('should handle expense form submission', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          summary: { totalTithes: 1000, totalOfferings: 500, totalIncome: 1500 },
          transactions: mockTransactions,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockExpenses,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          id: 'expense-2', 
          budget_id: 'budget-1',
          category_id: 'category-1',
          amount: 150,
          description: 'Test expense 2',
          date: '2024-01-02',
          payment_method: 'card',
          status: 'approved' as const,
          created_by: 'user-1',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          ...mockExpenses, 
          { 
            id: 'expense-2', 
            budget_id: 'budget-1',
            category_id: 'category-1',
            amount: 150,
            description: 'Test expense 2',
            date: '2024-01-02',
            payment_method: 'card',
            status: 'approved' as const,
            created_by: 'user-1',
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
          }
        ],
      });

    render(<FinancesPage />);

    await waitFor(() => {
      const newExpenseButton = screen.getByText('New Expense');
      fireEvent.click(newExpenseButton);
    });

    await waitFor(() => {
      const amountInput = screen.getByLabelText('Amount');
      const descriptionInput = screen.getByLabelText('Description');
      const dateInput = screen.getByLabelText('Date');

      fireEvent.change(amountInput, { target: { value: '150' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test expense' } });
      fireEvent.change(dateInput, { target: { value: '2024-01-02' } });
    });

    await waitFor(() => {
      const saveButton = screen.getByText('Save Expense');
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/financial/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 150,
          description: 'Test expense',
          date: '2024-01-02',
        }),
      });
    });
  });

  it('should display transactions in the transactions tab', async () => {
    render(<FinancesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test transaction')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });
  });

  it('should handle search functionality', async () => {
    render(<FinancesPage />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search transactions...');
      fireEvent.change(searchInput, { target: { value: 'Test' } });
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
    });
  });

  it('should handle type filtering', async () => {
    render(<FinancesPage />);

    await waitFor(() => {
      const typeFilter = screen.getByTestId('select');
      fireEvent.change(typeFilter, { target: { value: 'income' } });
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('income')).toBeInTheDocument();
    });
  });

  it('should export CSV when export button is clicked', async () => {
    const mockCreateObjectURL = jest.fn().mockReturnValue('blob:test');
    const mockRevokeObjectURL = jest.fn();
    const mockClick = jest.fn();

    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      },
    });

    Object.defineProperty(document, 'createElement', {
      value: () => ({
        href: '',
        download: '',
        click: mockClick,
      }),
    });

    render(<FinancesPage />);

    await waitFor(() => {
      const exportButton = screen.getByText('Export CSV');
      fireEvent.click(exportButton);
    });

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });

  it('should handle error states gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<FinancesPage />);

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  it('should close modals when cancel is clicked', async () => {
    render(<FinancesPage />);

    await waitFor(() => {
      const newTransactionButton = screen.getByText('New Transaction');
      fireEvent.click(newTransactionButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    await waitFor(() => {
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });
  });
}); 