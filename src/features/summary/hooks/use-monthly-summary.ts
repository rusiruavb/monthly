import { useQuery } from "@tanstack/react-query";
import { fetchTransactions } from "@/features/income-expense/services/income-expense-sheets";
import { fetchAllLoans } from "@/features/loans/services/loans-sheets";
import { aggregateSummary } from "@/features/summary/services/summary-aggregator";

export const SUMMARY_QUERY_KEY = ["summary"] as const;

export function useMonthlySummary() {
  return useQuery({
    queryKey: SUMMARY_QUERY_KEY,
    queryFn: async () => {
      const [transactions, loans] = await Promise.all([
        fetchTransactions(),
        fetchAllLoans(),
      ]);
      return aggregateSummary(transactions, loans);
    },
  });
}
