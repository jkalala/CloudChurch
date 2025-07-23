// AI-powered finance service for recommendations, analytics, and anomaly detection

export type FinancialTransaction = {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  account?: string;
  created_by?: string;
  created_at?: string;
};

export async function recommendBudgetCategories(transactions: FinancialTransaction[], criteria: { month?: string; }) {
  // Recommend categories based on past spending patterns
  // For now, return top categories by total expense
  const categoryTotals: Record<string, number> = {};
  transactions.forEach(tx => {
    if (tx.type === 'expense') {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    }
  });
  return Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, total]) => ({ category, total }));
}

export async function generateFinancialSummary(transactions: FinancialTransaction[]) {
  // Calculate total income, expenses, and balance
  let income = 0, expense = 0;
  transactions.forEach(tx => {
    if (tx.type === 'income') income += tx.amount;
    if (tx.type === 'expense') expense += tx.amount;
  });
  return {
    totalIncome: income,
    totalExpense: expense,
    balance: income - expense,
  };
}

export async function detectAnomalies(transactions: FinancialTransaction[]) {
  // Simple anomaly detection: flag transactions > 2x average expense
  const expenses = transactions.filter(tx => tx.type === 'expense');
  const avg = expenses.reduce((sum, tx) => sum + tx.amount, 0) / (expenses.length || 1);
  return expenses.filter(tx => tx.amount > 2 * avg);
}

export async function generateFinancialAnalytics({ transactions }: { transactions: FinancialTransaction[] }) {
  // Example analytics: monthly totals, category breakdown, anomaly count
  const monthly: Record<string, { income: number; expense: number }> = {};
  const category: Record<string, number> = {};
  let anomalyCount = 0;
  for (const tx of transactions) {
    const month = tx.date.slice(0, 7);
    if (!monthly[month]) monthly[month] = { income: 0, expense: 0 };
    if (tx.type === 'income') monthly[month].income += tx.amount;
    if (tx.type === 'expense') monthly[month].expense += tx.amount;
    if (tx.type === 'expense') category[tx.category] = (category[tx.category] || 0) + tx.amount;
  }
  const anomalies = await detectAnomalies(transactions);
  anomalyCount = anomalies.length;
  return {
    monthly,
    category,
    anomalyCount,
    anomalies,
  };
} 