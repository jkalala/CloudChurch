import { type NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/lib/database";
import { createServerClient } from "@/lib/supabase-client";
import { getUserRoleFromRequest } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (id) {
      const expense = await DatabaseService.getExpenseById(id);
      if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });
      return NextResponse.json(expense);
    }
    const expenses = await DatabaseService.getExpenses();
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const expenseData = await request.json();
    const newExpense = await DatabaseService.createExpense({ 
      ...expenseData, 
      created_by: "demo-user-id" // For demo purposes
    });
    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...expenseData } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });
    }
    const updatedExpense = await DatabaseService.updateExpense(id, expenseData);
    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });
    }
    await DatabaseService.deleteExpense(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
} 