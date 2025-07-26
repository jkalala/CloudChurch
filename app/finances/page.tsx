'use client';

import { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  MoreHorizontal,
  DollarSign,
  Calendar,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  BarChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { format, parseISO, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

// Define types for transactions and budgets
interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  method: string;
  status?: string;
  member_id?: string;
  member_name?: string;
}

interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  period: string;
}

interface Expense {
  id: string;
  budget_id?: string;
  category_id?: string;
  amount: number;
  description: string;
  date: string;
  payment_method: string;
  receipt_url?: string;
  vendor?: string;
  approved_by?: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const themeColor = "#000000";

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Modal states
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formState, setFormState] = useState<Partial<Transaction>>({});
  const [expenseFormState, setExpenseFormState] = useState<Partial<Expense>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Delete dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Transaction | Expense | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch transactions and summary
        const res = await fetch('/api/financial');
        const data = await res.json();
        setTransactions((data.transactions || []) as Transaction[]);
        
        // Fetch expenses
        const expensesRes = await fetch('/api/financial/expenses');
        const expensesData = await expensesRes.json();
        setExpenses(expensesData || []);
        
        // Fetch budgets
        const budgetsRes = await fetch('/api/financial?budgets=1');
        const budgetsData = await budgetsRes.json();
        setBudgets((budgetsData.budgets || []) as Budget[]);
      } catch (err) {
        console.error('Error fetching financial data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  // Calculate financial summary
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpenses;
  
  // Filter transactions based on search query and filters
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by type
    if (typeFilter !== 'all' && transaction.type !== typeFilter) return false;
    
    // Filter by category
    if (categoryFilter !== 'all' && transaction.category !== categoryFilter) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        transaction.description.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query) ||
        transaction.method.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Chart data
  const monthlyData = [
    { month: 'Jan', income: 18500, expenses: 15200 },
    { month: 'Feb', income: 17800, expenses: 14900 },
    { month: 'Mar', income: 19200, expenses: 16100 },
    { month: 'Apr', income: 20100, expenses: 15800 },
    { month: 'May', income: 18900, expenses: 16200 },
    { month: 'Jun', income: 21500, expenses: 17500 },
  ];

  const categoryData = [
    { name: 'Tithes', value: totalIncome * 0.4, color: '#8884d8' },
    { name: 'Offerings', value: totalIncome * 0.3, color: '#82ca9d' },
    { name: 'Donations', value: totalIncome * 0.2, color: '#ffc658' },
    { name: 'Events', value: totalIncome * 0.1, color: '#ff7300' },
  ];

  // Get transaction type badge class
  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'income': return 'bg-green-100 text-green-800';
      case 'expense': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get transaction method icon
  const getTransactionMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <DollarSign className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'check': return <FileText className="h-4 w-4" />;
      case 'online': return <Wallet className="h-4 w-4" />;
      case 'transfer': return <ArrowUpRight className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Handlers for transaction modal
  const openNewTransactionModal = () => {
    setEditingTransaction(null);
    setFormState({});
    setShowTransactionModal(true);
    setFormError(null);
  };

  const openEditTransactionModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormState(transaction);
    setShowTransactionModal(true);
    setFormError(null);
  };

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setEditingTransaction(null);
    setFormState({});
    setFormError(null);
  };

  // Handlers for expense modal
  const openNewExpenseModal = () => {
    setEditingExpense(null);
    setExpenseFormState({});
    setShowExpenseModal(true);
    setFormError(null);
  };

  const openEditExpenseModal = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseFormState(expense);
    setShowExpenseModal(true);
    setFormError(null);
  };

  const closeExpenseModal = () => {
    setShowExpenseModal(false);
    setEditingExpense(null);
    setExpenseFormState({});
    setFormError(null);
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleExpenseFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExpenseFormState(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const url = editingTransaction ? '/api/financial' : '/api/financial';
      const method = editingTransaction ? 'PUT' : 'POST';
      const body = editingTransaction 
        ? { id: editingTransaction.id, ...formState }
        : formState;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save transaction');
      }

      // Refresh data
      const res = await fetch('/api/financial');
      const data = await res.json();
      setTransactions((data.transactions || []) as Transaction[]);
      
      closeTransactionModal();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const url = editingExpense ? '/api/financial/expenses' : '/api/financial/expenses';
      const method = editingExpense ? 'PUT' : 'POST';
      const body = editingExpense 
        ? { id: editingExpense.id, ...expenseFormState }
        : expenseFormState;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save expense');
      }

      // Refresh data
      const expensesRes = await fetch('/api/financial/expenses');
      const expensesData = await expensesRes.json();
      setExpenses(expensesData || []);
      
      closeExpenseModal();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingItem) return;
    
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const isExpense = 'budget_id' in deletingItem;
      const url = isExpense ? '/api/financial/expenses' : '/api/financial';
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deletingItem.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      // Refresh data
      if (isExpense) {
        const expensesRes = await fetch('/api/financial/expenses');
        const expensesData = await expensesRes.json();
        setExpenses(expensesData || []);
      } else {
        const res = await fetch('/api/financial');
        const data = await res.json();
        setTransactions((data.transactions || []) as Transaction[]);
      }
      
      setShowDeleteDialog(false);
      setDeletingItem(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Type', 'Method'];
    const csvData = filteredTransactions.map(t => [
      t.date,
      t.description,
      t.category,
      t.amount,
      t.type,
      t.method
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
          <p className="text-muted-foreground">
            Track donations, tithes, and church finances.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={openNewTransactionModal}>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
          <Button variant="outline" onClick={openNewExpenseModal}>
            <Plus className="mr-2 h-4 w-4" />
            New Expense
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
              <div className="p-2 bg-green-100 rounded-full">
                <ArrowUpRight className="h-4 w-4 text-green-800" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              <span>+5.2% from last month</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              <div className="p-2 bg-red-100 rounded-full">
                <ArrowDownLeft className="h-4 w-4 text-red-800" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              <span>+2.4% from last month</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Wallet className="h-4 w-4 text-blue-800" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              <span>+8.1% from last month</span>
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search transactions..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Tithes">Tithes</SelectItem>
                  <SelectItem value="Offerings">Offerings</SelectItem>
                  <SelectItem value="Donations">Donations</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Events">Events</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{format(parseISO(transaction.date), 'MMM d, yyyy')}</span>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${getTransactionTypeBadge(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getTransactionMethodIcon(transaction.method)}
                          <span className="text-xs">{transaction.method}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditTransactionModal(transaction)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setDeletingItem(transaction);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Expense Management</h2>
            <Button onClick={openNewExpenseModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(expenses || []).map(expense => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{format(parseISO(expense.date), 'MMM d, yyyy')}</span>
                        </div>
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.vendor || 'N/A'}</TableCell>
                      <TableCell className="text-red-600">
                        -{formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={expense.status === 'approved' ? 'default' : 'secondary'}>
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditExpenseModal(expense)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setDeletingItem(expense);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(budgets || []).map(budget => (
              <Card key={budget.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {budget.category}
                    <Badge variant="outline">{budget.period}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Allocated</span>
                      <span className="font-medium">{formatCurrency(budget.allocated)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spent</span>
                      <span className="font-medium text-red-600">{formatCurrency(budget.spent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining</span>
                      <span className="font-medium text-green-600">{formatCurrency(budget.remaining)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(budget.spent / budget.allocated) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Income vs. Expenses</CardTitle>
                <CardDescription>Monthly comparison</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="income" fill="#10b981" name="Income" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Income Distribution</CardTitle>
                <CardDescription>By category</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                                             label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Year-to-date overview</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Income</TableHead>
                      <TableHead>Expenses</TableHead>
                      <TableHead>Net</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell>{data.month}</TableCell>
                        <TableCell className="text-green-600">{formatCurrency(data.income)}</TableCell>
                        <TableCell className="text-red-600">{formatCurrency(data.expenses)}</TableCell>
                        <TableCell className={data.income - data.expenses >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(data.income - data.expenses)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Modal */}
      <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTransactionSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  value={formState.amount || ''}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select 
                  name="type" 
                  value={formState.type || 'income'} 
                  onValueChange={(value) => setFormState(prev => ({ ...prev, type: value as 'income' | 'expense' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                required
                value={formState.description || ''}
                onChange={handleFormChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  name="category" 
                  value={formState.category || ''} 
                  onValueChange={(value) => setFormState(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tithes">Tithes</SelectItem>
                    <SelectItem value="Offerings">Offerings</SelectItem>
                    <SelectItem value="Donations">Donations</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Events">Events</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="method">Payment Method</Label>
                <Select 
                  name="method" 
                  value={formState.method || 'cash'} 
                  onValueChange={(value) => setFormState(prev => ({ ...prev, method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                value={formState.date || new Date().toISOString().split('T')[0]}
                onChange={handleFormChange}
              />
            </div>
            
            {formError && (
              <div className="text-red-600 text-sm">{formError}</div>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeTransactionModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Saving...' : (editingTransaction ? 'Update' : 'Create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Expense Modal */}
      <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? 'Edit Expense' : 'New Expense'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                value={expenseFormState.amount || ''}
                onChange={handleExpenseFormChange}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                required
                value={expenseFormState.description || ''}
                onChange={handleExpenseFormChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  name="vendor"
                  value={expenseFormState.vendor || ''}
                  onChange={handleExpenseFormChange}
                />
              </div>
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select 
                  name="payment_method" 
                  value={expenseFormState.payment_method || 'cash'} 
                  onValueChange={(value) => setExpenseFormState(prev => ({ ...prev, payment_method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                value={expenseFormState.date || new Date().toISOString().split('T')[0]}
                onChange={handleExpenseFormChange}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={expenseFormState.notes || ''}
                onChange={handleExpenseFormChange}
              />
            </div>
            
            {formError && (
              <div className="text-red-600 text-sm">{formError}</div>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeExpenseModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Saving...' : (editingExpense ? 'Update' : 'Create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>
          {deleteError && (
            <div className="text-red-600 text-sm">{deleteError}</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}