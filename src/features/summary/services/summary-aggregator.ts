import type { Transaction } from "@/features/income-expense/types/transaction";
import type { Loan } from "@/features/loans/types/loan";
import type { MonthlySummary } from "@/features/summary/types/summary";
import { format, parseISO, subMonths, isValid } from "date-fns";

function monthKey(date: Date): string {
  return format(date, "yyyy-MM");
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return format(new Date(y, m - 1, 1), "MMM yyyy");
}

export function aggregateSummary(
  transactions: Transaction[],
  loans: Loan[],
): MonthlySummary {
  const now = new Date();
  const currentKey = monthKey(now);

  const trendKeys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    trendKeys.push(monthKey(subMonths(now, i)));
  }

  const trendMap = new Map(
    trendKeys.map((k) => [
      k,
      { month: monthLabel(k), income: 0, expense: 0, loanPayments: 0 },
    ]),
  );

  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of transactions) {
    const d = parseISO(t.date);
    if (!isValid(d)) continue;
    const key = monthKey(d);
    const point = trendMap.get(key);
    if (t.financeType === "Income") {
      if (point) point.income += t.amount;
      if (key === currentKey) totalIncome += t.amount;
    } else {
      if (point) point.expense += t.amount;
      if (key === currentKey) totalExpense += t.amount;
    }
  }

  for (const loan of loans) {
    for (const p of loan.payments) {
      if (p.status === "paid") {
        const key = currentKey;
        const point = trendMap.get(key);
        if (point) point.loanPayments += p.paymentAmount;
      }
    }
  }

  const loanPaymentsDue = loans.reduce((sum, loan) => {
    const nextPending = loan.payments.find((p) => p.status === "pending");
    return sum + (nextPending?.paymentAmount ?? 0);
  }, 0);

  const monthlyTrend = trendKeys.map((k) => {
    const p = trendMap.get(k)!;
    return {
      month: p.month,
      income: p.income,
      expense: p.expense,
      loanPayments: p.loanPayments,
    };
  });

  return {
    currentMonth: format(now, "MMMM yyyy"),
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    loanPaymentsDue,
    monthlyTrend,
    incomeVsExpenseRatio: [
      { name: "Income", value: totalIncome },
      { name: "Expense", value: totalExpense },
    ],
  };
}
