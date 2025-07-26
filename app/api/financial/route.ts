import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { createServerClient } from "@/lib/supabase-client"
import { getUserRoleFromRequest } from "@/lib/auth-helpers"
import { recommendBudgetCategories, generateFinancialAnalytics, detectAnomalies } from '@/lib/ai-finance';
import type { FinancialTransaction as DBFinancialTransaction } from '@/lib/database';

// Helper to extract access token from cookies
function getAccessToken(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") || ""
  const cookies = Object.fromEntries(cookieHeader.split(';').map(c => {
    const [k, ...v] = c.trim().split('=')
    return [k, decodeURIComponent(v.join('='))]
  }))
  return cookies["sb-access-token"] || cookies["access_token"]
}

function mapToAIFinancialTransaction(tx: DBFinancialTransaction) {
  return {
    id: tx.id,
    date: tx.transaction_date,
    amount: tx.amount,
    type: tx.transaction_type === 'income' ? 'income' : 'expense' as 'income' | 'expense',
    category: 'General', // Default category since database doesn't have this field
    description: tx.description,
    account: tx.payment_method,
    created_by: tx.created_by,
    created_at: tx.created_at,
  };
}

export async function GET() {
  try {
    const [summary, transactions] = await Promise.all([
      DatabaseService.getFinancialSummary(),
      DatabaseService.getFinancialTransactions(),
    ])

    // Map database fields to frontend format
    const mappedTransactions = transactions.map(tx => ({
      id: tx.id,
      date: tx.transaction_date,
      description: tx.description || tx.notes || '',
      category: 'General', // Default category since database doesn't have this field
      amount: tx.amount,
      type: tx.transaction_type as 'income' | 'expense',
      method: tx.payment_method,
      status: 'completed',
      member_id: tx.member_id,
      member_name: tx.members?.first_name && tx.members?.last_name 
        ? `${tx.members.first_name} ${tx.members.last_name}` 
        : undefined
    }))

    return NextResponse.json({
      summary,
      transactions: mappedTransactions.slice(0, 10), // Latest 10 transactions
    })
  } catch (error) {
    console.error("Error fetching financial data:", error)
    return NextResponse.json({ error: "Failed to fetch financial data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const transactionData = await request.json()
    
    // Map frontend fields to database fields
    const mappedData = {
      amount: transactionData.amount,
      transaction_type: transactionData.type,
      payment_method: transactionData.method,
      transaction_date: transactionData.date,
      description: transactionData.description,
      created_by: "demo-user-id" // For demo purposes
    }
    
    const newTransaction = await DatabaseService.createFinancialTransaction(mappedData)
    return NextResponse.json(newTransaction, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...transactionData } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
    }
    
    // Map frontend fields to database fields
    const mappedData = {
      amount: transactionData.amount,
      transaction_type: transactionData.type,
      payment_method: transactionData.method,
      transaction_date: transactionData.date,
      description: transactionData.description,
    }
    
    const updatedTransaction = await DatabaseService.updateFinancialTransaction(id, mappedData)
    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
    }
    await DatabaseService.deleteFinancialTransaction(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 })
  }
}

// AI Analytics endpoint
export async function GET_ANALYTICS() {
  try {
    const transactionsRaw = await DatabaseService.getFinancialTransactions();
    const transactions = transactionsRaw.map(mapToAIFinancialTransaction);
    const analytics = await generateFinancialAnalytics({ transactions });
    return NextResponse.json(analytics);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate analytics' }, { status: 500 });
  }
}

// AI Recommend Categories endpoint
export async function POST_RECOMMEND_CATEGORIES(request: NextRequest) {
  try {
    const transactionsRaw = await DatabaseService.getFinancialTransactions();
    const transactions = transactionsRaw.map(mapToAIFinancialTransaction);
    const criteria = await request.json();
    const recommendations = await recommendBudgetCategories(transactions, criteria);
    return NextResponse.json({ recommendations });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to recommend categories' }, { status: 500 });
  }
}

// AI Anomaly Detection endpoint
export async function GET_ANOMALIES() {
  try {
    const transactionsRaw = await DatabaseService.getFinancialTransactions();
    const transactions = transactionsRaw.map(mapToAIFinancialTransaction);
    const anomalies = await detectAnomalies(transactions);
    return NextResponse.json({ anomalies });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to detect anomalies' }, { status: 500 });
  }
}
