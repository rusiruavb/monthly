export interface MonthlyDataPoint {
  month: string;
  income: number;
  expense: number;
  loanPayments: number;
}

export interface MonthlySummary {
  currentMonth: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  loanPaymentsDue: number;
  monthlyTrend: MonthlyDataPoint[];
  incomeVsExpenseRatio: { name: string; value: number }[];
}
