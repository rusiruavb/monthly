import { useQuery } from "@tanstack/react-query";
import { fetchTransactions } from "@/features/income-expense/services/income-expense-sheets";

export const INCOME_EXPENSE_QUERY_KEY = ["income-expense"] as const;

export function useIncomeExpenses() {
  return useQuery({
    queryKey: INCOME_EXPENSE_QUERY_KEY,
    queryFn: fetchTransactions,
  });
}
