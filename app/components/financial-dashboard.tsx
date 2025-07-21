"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  CreditCard,
  Download,
  Plus,
  Smartphone,
  Banknote,
  Wallet,
  Filter,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatabaseService } from "@/lib/database"
import { useTranslation } from "@/lib/i18n"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/components/auth-provider";

interface FinancialSummary {
  totalTithes: number
  totalOfferings: number
  totalIncome: number
  totalExpenses: number
  netIncome: number
  monthlyGrowth: number
}

interface Transaction {
  id: string
  amount: number
  type: "tithe" | "offering" | "expense" | "donation"
  description: string
  date: string
  payment_method: string
  member_name?: string
  category?: string
  status: "completed" | "pending" | "failed"
}

interface Budget {
  id: string
  name: string
  total_amount: number
  spent_amount: number
  period: string
  status: string
  categories: BudgetCategory[]
}

interface BudgetCategory {
  id: string
  name: string
  allocated_amount: number
  spent_amount: number
  color: string
  icon: string
}

export default function FinancialDashboard() {
  const { language } = useAuth();
  const { t } = useTranslation(language);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalTithes: 0,
    totalOfferings: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    monthlyGrowth: 0,
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showAddBudget, setShowAddBudget] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // New transaction form state
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    type: "tithe" as const,
    description: "",
    payment_method: "cash",
    member_id: "",
    category: "",
  })

  // New budget form state
  const [newBudget, setNewBudget] = useState({
    name: "",
    description: "",
    total_amount: "",
    period: "monthly",
    categories: [] as { name: string; allocated_amount: string; color: string; icon: string }[],
  })

  const isIncome = (type: string) => ["tithe", "offering", "donation"].includes(type);

  useEffect(() => {
    loadFinancialData()
  }, [selectedPeriod])

  const loadFinancialData = async () => {
    try {
      setLoading(true)
      const [summaryData, transactionsData, budgetsData] = await Promise.all([
        DatabaseService.getFinancialSummary(),
        DatabaseService.getFinancialTransactions(),
        DatabaseService.getBudgets(),
      ])

      // Calculate additional metrics
      const totalExpenses = budgetsData.reduce(
        (sum, budget) => sum + budget.categories.reduce((catSum, cat) => catSum + cat.spent_amount, 0),
        0,
      )

      const netIncome = summaryData.totalIncome - totalExpenses
      const monthlyGrowth = 12.5 // This would be calculated from historical data

      setSummary({
        ...summaryData,
        totalExpenses,
        netIncome,
        monthlyGrowth,
      })

      setTransactions(
        transactionsData.map((t) => ({
          id: t.id,
          amount: Number(t.amount),
          type: t.transaction_type as any,
          description: t.description || `${t.transaction_type} payment`,
          date: t.transaction_date,
          payment_method: t.payment_method,
          member_name: t.members ? `${t.members.first_name} ${t.members.last_name}` : "Anonymous",
          status: "completed",
        })),
      )

      setBudgets(budgetsData)
    } catch (error) {
      console.error("Error loading financial data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTransaction = async () => {
    try {
      const transactionData = {
        amount: Number.parseFloat(newTransaction.amount),
        transaction_type: newTransaction.type,
        description: newTransaction.description,
        payment_method: newTransaction.payment_method,
        transaction_date: new Date().toISOString(),
        member_id: newTransaction.member_id || undefined,
        category: newTransaction.category || undefined,
      }

      await DatabaseService.createFinancialTransaction(transactionData)
      setShowAddTransaction(false)
      setNewTransaction({
        amount: "",
        type: "tithe",
        description: "",
        payment_method: "cash",
        member_id: "",
        category: "",
      })
      loadFinancialData()
    } catch (error) {
      console.error("Error adding transaction:", error)
    }
  }

  const handleAddBudget = async () => {
    try {
      const budgetData = {
        name: newBudget.name,
        description: newBudget.description,
        total_amount: Number.parseFloat(newBudget.total_amount),
        period: newBudget.period,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      }

      await DatabaseService.createBudget(budgetData)
      setShowAddBudget(false)
      setNewBudget({
        name: "",
        description: "",
        total_amount: "",
        period: "monthly",
        categories: [],
      })
      loadFinancialData()
    } catch (error) {
      console.error("Error adding budget:", error)
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.member_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || transaction.type === filterType
    return matchesSearch && matchesFilter
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
    }).format(amount)
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "mpesa":
      case "mobile_money":
        return <Smartphone className="h-4 w-4" />
      case "cash":
        return <Banknote className="h-4 w-4" />
      case "card":
      case "bank_transfer":
        return <CreditCard className="h-4 w-4" />
      default:
        return <Wallet className="h-4 w-4" />
    }
  }

  const stats = [
    {
      title: "Receita Total",
      value: formatCurrency(summary.totalIncome),
      change: `+${summary.monthlyGrowth}%`,
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Despesas",
      value: formatCurrency(summary.totalExpenses),
      change: `-${((summary.totalExpenses / summary.totalIncome) * 100).toFixed(1)}%`,
      trend: "down",
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Saldo Atual",
      value: formatCurrency(summary.netIncome),
      change: `+${((summary.netIncome / summary.totalIncome) * 100).toFixed(1)}%`,
      trend: summary.netIncome >= 0 ? "up" : "down",
      icon: Wallet,
      color: summary.netIncome >= 0 ? "text-blue-600" : "text-red-600",
      bgColor: summary.netIncome >= 0 ? "bg-blue-50" : "bg-red-50",
    },
    {
      title: "Dízimos",
      value: formatCurrency(summary.totalTithes),
      change: `+${((summary.totalTithes / summary.totalIncome) * 100).toFixed(1)}%`,
      trend: "up",
      icon: PiggyBank,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("finance")}</h2>
          <p className="text-gray-600">{t("financial.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t("financial.report")}
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            {t("financial.filters")}
          </Button>
          <Button size="sm" onClick={() => setShowAddTransaction(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("financial.addTransaction")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <Badge variant={stat.trend === "up" ? "default" : "secondary"}>{stat.change}</Badge>
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t("financial.management")}
          </CardTitle>
          <CardDescription>{t("financial.managementDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">{t("financial.tabs.overview")}</TabsTrigger>
              <TabsTrigger value="income">{t("financial.tabs.income")}</TabsTrigger>
              <TabsTrigger value="expenses">{t("financial.tabs.expenses")}</TabsTrigger>
              <TabsTrigger value="reports">{t("financial.tabs.reports")}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Transações Recentes</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 5).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Badge variant={isIncome(transaction.type) ? "default" : "secondary"}>
                            {isIncome(transaction.type) ? "Receita" : "Despesa"}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className={isIncome(transaction.type) ? "text-green-600" : "text-red-600"}>
                          {isIncome(transaction.type) ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>{new Date(transaction.date).toLocaleDateString("pt-BR")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="income" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Receitas</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions
                      .filter((t) => isIncome(t.type))
                      .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell className="text-green-600">{formatCurrency(transaction.amount)}</TableCell>
                          <TableCell>{new Date(transaction.date).toLocaleDateString("pt-BR")}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="expenses" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Despesas</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions
                      .filter((t) => t.type === "expense")
                      .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell className="text-red-600">{formatCurrency(transaction.amount)}</TableCell>
                          <TableCell>{new Date(transaction.date).toLocaleDateString("pt-BR")}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="mt-4">
              <div className="text-center py-8">
                <TrendingUp className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Relatórios Financeiros</h3>
                <p className="text-gray-600 mb-4">Análises detalhadas das finanças</p>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Transaction Modal */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
            <DialogDescription>Registre uma nova movimentação financeira</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Valor</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={newTransaction.type}
                  onValueChange={(value: any) => setNewTransaction({ ...newTransaction, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tithe">Dízimo</SelectItem>
                    <SelectItem value="offering">Oferta</SelectItem>
                    <SelectItem value="donation">Doação</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Descrição da transação"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="payment_method">Método de Pagamento</Label>
              <Select
                value={newTransaction.payment_method}
                onValueChange={(value) => setNewTransaction({ ...newTransaction, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="bank_transfer">Transferência</SelectItem>
                  <SelectItem value="card">Cartão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddTransaction(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddTransaction}>Adicionar Transação</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Budget Modal */}
      <Dialog open={showAddBudget} onOpenChange={setShowAddBudget}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
            <DialogDescription>Crie um novo orçamento para controlar gastos</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="budget_name">Nome do Orçamento</Label>
              <Input
                id="budget_name"
                placeholder="Ex: Orçamento 2024"
                value={newBudget.name}
                onChange={(e) => setNewBudget({ ...newBudget, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="budget_description">Descrição</Label>
              <Textarea
                id="budget_description"
                placeholder="Descrição do orçamento"
                value={newBudget.description}
                onChange={(e) => setNewBudget({ ...newBudget, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total_amount">Valor Total</Label>
                <Input
                  id="total_amount"
                  type="number"
                  placeholder="0.00"
                  value={newBudget.total_amount}
                  onChange={(e) => setNewBudget({ ...newBudget, total_amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="period">Período</Label>
                <Select
                  value={newBudget.period}
                  onValueChange={(value) => setNewBudget({ ...newBudget, period: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddBudget(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddBudget}>Criar Orçamento</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
