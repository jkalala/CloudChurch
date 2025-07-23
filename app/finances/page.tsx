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
  TrendingDown
} from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export const themeColor = "#000000";
export const viewport = "width=device-width, initial-scale=1, maximum-scale=1";

// Remove sample transaction and budget data
// const transactions = [
//   {
//     id: '1',
//     date: '2025-07-18',
//     description: 'Sunday Offering',
//     category: 'Tithes',
//     amount: 3250.00,
//     type: 'income',
//     method: 'cash',
//     status: 'completed'
//   },
//   {
//     id: '2',
//     date: '2025-07-18',
//     description: 'Online Donation',
//     category: 'Tithes',
//     amount: 1750.50,
//     type: 'income',
//     method: 'online',
//     status: 'completed'
//   },
//   {
//     id: '3',
//     date: '2025-07-17',
//     description: 'Utility Bill Payment',
//     category: 'Utilities',
//     amount: 425.75,
//     type: 'expense',
//     method: 'check',
//     status: 'completed'
//   },
//   {
//     id: '4',
//     date: '2025-07-16',
//     description: 'Youth Camp Registrations',
//     category: 'Events',
//     amount: 1200.00,
//     type: 'income',
//     method: 'online',
//     status: 'completed'
//   },
//   {
//     id: '5',
//     date: '2025-07-15',
//     description: 'Office Supplies',
//     category: 'Administration',
//     amount: 187.45,
//     type: 'expense',
//     method: 'card',
//     status: 'completed'
//   },
//   {
//     id: '6',
//     date: '2025-07-14',
//     description: 'Staff Salary',
//     category: 'Payroll',
//     amount: 4500.00,
//     type: 'expense',
//     method: 'transfer',
//     status: 'completed'
//   }
// ];

// const budgets = [
//   {
//     id: '1',
//     category: 'Facilities',
//     allocated: 5000.00,
//     spent: 3250.75,
//     remaining: 1749.25,
//     period: 'July 2025'
//   },
//   {
//     id: '2',
//     category: 'Ministries',
//     allocated: 3000.00,
//     spent: 1875.50,
//     remaining: 1124.50,
//     period: 'July 2025'
//   },
//   {
//     id: '3',
//     category: 'Missions',
//     allocated: 2500.00,
//     spent: 1000.00,
//     remaining: 1500.00,
//     period: 'July 2025'
//   },
//   {
//     id: '4',
//     category: 'Administration',
//     allocated: 1500.00,
//     spent: 875.25,
//     remaining: 624.75,
//     period: 'July 2025'
//   },
//   {
//     id: '5',
//     category: 'Events',
//     allocated: 2000.00,
//     spent: 1250.00,
//     remaining: 750.00,
//     period: 'July 2025'
//   }
// ];

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
}

interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  period: string;
}

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formState, setFormState] = useState<Partial<Transaction>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Budget modal and delete dialog state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetFormState, setBudgetFormState] = useState<Partial<Budget>>({});
  const [budgetFormLoading, setBudgetFormLoading] = useState(false);
  const [budgetFormError, setBudgetFormError] = useState<string | null>(null);
  const [showBudgetDeleteDialog, setShowBudgetDeleteDialog] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [budgetDeleteLoading, setBudgetDeleteLoading] = useState(false);
  const [budgetDeleteError, setBudgetDeleteError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch transactions and summary
        const res = await fetch('/api/financial');
        const data = await res.json();
        setTransactions((data.transactions || []) as Transaction[]);
        // Fetch budgets
        const budgetsRes = await fetch('/api/financial?budgets=1');
        const budgetsData = await budgetsRes.json();
        setBudgets((budgetsData.budgets || []) as Budget[]);
      } catch (err) {
        // Optionally handle error
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
  
  // Filter transactions based on search query and type filter
  const filteredTransactions = transactions.filter(transaction => {
    // First filter by type
    if (typeFilter !== 'all' && transaction.type !== typeFilter) return false;
    
    // Then filter by search query
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
  
  // Calculate budget progress percentage
  const getBudgetProgress = (spent: number, allocated: number) => {
    return Math.round((spent / allocated) * 100);
  };

  // Handlers for opening/closing modal
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

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submit (create or update)
  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const method = editingTransaction ? 'PUT' : 'POST';
      const body = editingTransaction ? { ...formState, id: editingTransaction.id } : formState;
      const res = await fetch('/api/financial', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save transaction');
      }
      // Refresh transactions
      const data = await fetch('/api/financial').then(r => r.json());
      setTransactions((data.transactions || []) as Transaction[]);
      closeTransactionModal();
    } catch (err: any) {
      setFormError(err.message || 'Error');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete handlers
  const openDeleteDialog = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
    setShowDeleteDialog(true);
    setDeleteError(null);
  };
  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeletingTransaction(null);
    setDeleteError(null);
  };
  const handleDeleteTransaction = async () => {
    if (!deletingTransaction) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/financial', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deletingTransaction.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete transaction');
      }
      // Refresh transactions
      const data = await fetch('/api/financial').then(r => r.json());
      setTransactions((data.transactions || []) as Transaction[]);
      closeDeleteDialog();
    } catch (err: any) {
      setDeleteError(err.message || 'Error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Budget modal handlers
  const openNewBudgetModal = () => {
    setEditingBudget(null);
    setBudgetFormState({});
    setShowBudgetModal(true);
    setBudgetFormError(null);
  };
  const openEditBudgetModal = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetFormState(budget);
    setShowBudgetModal(true);
    setBudgetFormError(null);
  };
  const closeBudgetModal = () => {
    setShowBudgetModal(false);
    setEditingBudget(null);
    setBudgetFormState({});
    setBudgetFormError(null);
  };
  const handleBudgetFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBudgetFormState(prev => ({ ...prev, [name]: value }));
  };
  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetFormLoading(true);
    setBudgetFormError(null);
    try {
      const method = editingBudget ? 'PUT' : 'POST';
      const body = editingBudget ? { ...budgetFormState, id: editingBudget.id } : budgetFormState;
      const res = await fetch('/api/financial?budgets=1', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save budget');
      }
      // Refresh budgets
      const data = await fetch('/api/financial?budgets=1').then(r => r.json());
      setBudgets((data.budgets || []) as Budget[]);
      closeBudgetModal();
    } catch (err: any) {
      setBudgetFormError(err.message || 'Error');
    } finally {
      setBudgetFormLoading(false);
    }
  };

  // Budget delete handlers
  const openBudgetDeleteDialog = (budget: Budget) => {
    setDeletingBudget(budget);
    setShowBudgetDeleteDialog(true);
    setBudgetDeleteError(null);
  };
  const closeBudgetDeleteDialog = () => {
    setShowBudgetDeleteDialog(false);
    setDeletingBudget(null);
    setBudgetDeleteError(null);
  };
  const handleDeleteBudget = async () => {
    if (!deletingBudget) return;
    setBudgetDeleteLoading(true);
    setBudgetDeleteError(null);
    try {
      const res = await fetch('/api/financial?budgets=1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deletingBudget.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete budget');
      }
      // Refresh budgets
      const data = await fetch('/api/financial?budgets=1').then(r => r.json());
      setBudgets((data.budgets || []) as Budget[]);
      closeBudgetDeleteDialog();
    } catch (err: any) {
      setBudgetDeleteError(err.message || 'Error');
    } finally {
      setBudgetDeleteLoading(false);
    }
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
          <Button onClick={openNewTransactionModal}>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
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
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="giving">Giving</TabsTrigger>
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
            
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                    All Transactions
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter('income')}>
                    Income Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter('expense')}>
                    Expenses Only
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setDateRange('week')}>
                    This Week
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateRange('month')}>
                    This Month
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateRange('quarter')}>
                    This Quarter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateRange('year')}>
                    This Year
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
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
                        <div className="flex items-center">
                          {getTransactionMethodIcon(transaction.method)}
                          <span className="ml-1 capitalize">{transaction.method}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditTransactionModal(transaction)}>Edit Transaction</DropdownMenuItem>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Print Receipt</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(transaction)}>Delete Transaction</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="budgets">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Budget Management</h2>
            <div className="flex space-x-2">
              <Button onClick={openNewBudgetModal}>
                <Plus className="mr-2 h-4 w-4" />
                New Budget
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map(budget => (
              <Card key={budget.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-base">{budget.category}</CardTitle>
                    <span className="text-sm text-muted-foreground">{budget.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget</span>
                      <span className="font-medium">{formatCurrency(budget.allocated)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Spent</span>
                      <span className="font-medium">{formatCurrency(budget.spent)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Remaining</span>
                      <span className="font-medium">{formatCurrency(budget.remaining)}</span>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          getBudgetProgress(budget.spent, budget.allocated) > 90 
                            ? 'bg-red-600' 
                            : getBudgetProgress(budget.spent, budget.allocated) > 75 
                              ? 'bg-yellow-500' 
                              : 'bg-green-600'
                        }`}
                        style={{ width: `${getBudgetProgress(budget.spent, budget.allocated)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-right text-muted-foreground">
                      {getBudgetProgress(budget.spent, budget.allocated)}% used
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditBudgetModal(budget)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => openBudgetDeleteDialog(budget)}>Delete</Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="reports">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Financial Reports</h2>
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    July 2025
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>June 2025</DropdownMenuItem>
                  <DropdownMenuItem>July 2025</DropdownMenuItem>
                  <DropdownMenuItem>August 2025</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Q2 2025</DropdownMenuItem>
                  <DropdownMenuItem>Q3 2025</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Custom Range...</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Income vs. Expenses</CardTitle>
                <CardDescription>Monthly comparison</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                  <div className="text-center">
                    <BarChart className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Bar chart visualization would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Income Distribution</CardTitle>
                <CardDescription>By category</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Pie chart visualization would go here</p>
                  </div>
                </div>
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
                    <TableRow>
                      <TableCell>January</TableCell>
                      <TableCell>{formatCurrency(18500)}</TableCell>
                      <TableCell>{formatCurrency(15200)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(3300)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>February</TableCell>
                      <TableCell>{formatCurrency(17800)}</TableCell>
                      <TableCell>{formatCurrency(14900)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(2900)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>March</TableCell>
                      <TableCell>{formatCurrency(19200)}</TableCell>
                      <TableCell>{formatCurrency(16100)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(3100)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>April</TableCell>
                      <TableCell>{formatCurrency(20100)}</TableCell>
                      <TableCell>{formatCurrency(16800)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(3300)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>May</TableCell>
                      <TableCell>{formatCurrency(19500)}</TableCell>
                      <TableCell>{formatCurrency(17200)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(2300)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>June</TableCell>
                      <TableCell>{formatCurrency(21000)}</TableCell>
                      <TableCell>{formatCurrency(18500)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(2500)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Generate Annual Report
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="giving">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Giving Management</h2>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Statements
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Record Donation
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Giving</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(42500)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  <span>+8.3% from last month</span>
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Online Giving</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(28750)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  <span>+12.5% from last month</span>
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Active Givers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  <span>+5 from last month</span>
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Givers</CardTitle>
              <CardDescription>Year-to-date giving summary</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>YTD Giving</TableHead>
                    <TableHead>Last Gift</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>John & Mary Smith</TableCell>
                    <TableCell>{formatCurrency(5200)}</TableCell>
                    <TableCell>July 14, 2025</TableCell>
                    <TableCell>Weekly</TableCell>
                    <TableCell>Online</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View History</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Robert Johnson</TableCell>
                    <TableCell>{formatCurrency(4800)}</TableCell>
                    <TableCell>July 14, 2025</TableCell>
                    <TableCell>Weekly</TableCell>
                    <TableCell>Check</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View History</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sarah Williams</TableCell>
                    <TableCell>{formatCurrency(3750)}</TableCell>
                    <TableCell>July 10, 2025</TableCell>
                    <TableCell>Monthly</TableCell>
                    <TableCell>Online</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View History</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Michael & Jennifer Davis</TableCell>
                    <TableCell>{formatCurrency(3200)}</TableCell>
                    <TableCell>July 14, 2025</TableCell>
                    <TableCell>Weekly</TableCell>
                    <TableCell>Online</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View History</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Thomas Anderson</TableCell>
                    <TableCell>{formatCurrency(2800)}</TableCell>
                    <TableCell>July 7, 2025</TableCell>
                    <TableCell>Bi-weekly</TableCell>
                    <TableCell>Cash</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View History</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Generate Giving Statements</Button>
              <Button variant="outline">Send Thank You Emails</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Modal */}
      <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTransactionSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input type="date" name="date" value={formState.date || ''} onChange={handleFormChange} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input name="description" value={formState.description || ''} onChange={handleFormChange} required />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input name="category" value={formState.category || ''} onChange={handleFormChange} required />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input type="number" name="amount" value={formState.amount || ''} onChange={handleFormChange} required min="0" step="0.01" />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <select name="type" value={formState.type || ''} onChange={handleFormChange} required className="w-full border rounded p-2">
                <option value="">Select type</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <Label htmlFor="method">Method</Label>
              <Input name="method" value={formState.method || ''} onChange={handleFormChange} required />
            </div>
            {formError && <div className="text-red-600 text-sm">{formError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeTransactionModal} disabled={formLoading}>Cancel</Button>
              <Button type="submit" disabled={formLoading}>{formLoading ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this transaction?</div>
          {deleteError && <div className="text-red-600 text-sm">{deleteError}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDeleteDialog} disabled={deleteLoading}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteTransaction} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Budget Modal */}
      <Dialog open={showBudgetModal} onOpenChange={setShowBudgetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBudget ? 'Edit Budget' : 'New Budget'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBudgetSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Input name="category" value={budgetFormState.category || ''} onChange={handleBudgetFormChange} required />
            </div>
            <div>
              <Label htmlFor="allocated">Allocated</Label>
              <Input type="number" name="allocated" value={budgetFormState.allocated || ''} onChange={handleBudgetFormChange} required min="0" step="0.01" />
            </div>
            <div>
              <Label htmlFor="spent">Spent</Label>
              <Input type="number" name="spent" value={budgetFormState.spent || ''} onChange={handleBudgetFormChange} required min="0" step="0.01" />
            </div>
            <div>
              <Label htmlFor="remaining">Remaining</Label>
              <Input type="number" name="remaining" value={budgetFormState.remaining || ''} onChange={handleBudgetFormChange} required min="0" step="0.01" />
            </div>
            <div>
              <Label htmlFor="period">Period</Label>
              <Input name="period" value={budgetFormState.period || ''} onChange={handleBudgetFormChange} required />
            </div>
            {budgetFormError && <div className="text-red-600 text-sm">{budgetFormError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeBudgetModal} disabled={budgetFormLoading}>Cancel</Button>
              <Button type="submit" disabled={budgetFormLoading}>{budgetFormLoading ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Budget Delete Confirmation Dialog */}
      <Dialog open={showBudgetDeleteDialog} onOpenChange={setShowBudgetDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Budget</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this budget?</div>
          {budgetDeleteError && <div className="text-red-600 text-sm">{budgetDeleteError}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeBudgetDeleteDialog} disabled={budgetDeleteLoading}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteBudget} disabled={budgetDeleteLoading}>
              {budgetDeleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}