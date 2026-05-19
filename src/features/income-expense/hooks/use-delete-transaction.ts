import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { INCOME_EXPENSE_QUERY_KEY } from "@/features/income-expense/hooks/use-income-expenses";
import { removeTransaction } from "@/features/income-expense/services/income-expense-sheets";

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rowIndex: number) => removeTransaction(rowIndex),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INCOME_EXPENSE_QUERY_KEY });
      toast.success("Transaction deleted");
    },
    onError: (err) => toast.error(String(err)),
  });
}
