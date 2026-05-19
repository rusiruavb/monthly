import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { INCOME_EXPENSE_QUERY_KEY } from "@/features/income-expense/hooks/use-income-expenses";
import { updateTransaction } from "@/features/income-expense/services/income-expense-sheets";
import type { TransactionFormValues } from "@/features/income-expense/schemas/transaction-schema";

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      rowIndex,
      data,
      existingLink,
    }: {
      rowIndex: number;
      data: TransactionFormValues;
      existingLink?: string;
    }) =>
      updateTransaction(rowIndex, {
        date: data.date,
        amount: data.amount,
        description: data.description,
        financeType: data.financeType,
        file: data.file,
        existingLink,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INCOME_EXPENSE_QUERY_KEY });
      toast.success("Transaction updated");
    },
    onError: (err) => toast.error(String(err)),
  });
}
