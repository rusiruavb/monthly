import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createLoanSheet } from "@/features/loans/services/create-loan-sheet";
import { LOANS_QUERY_KEY } from "@/features/loans/hooks/use-loans";
import type { LoanFormValues } from "@/features/loans/schemas/loan-schema";

export function useCreateLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: LoanFormValues) => createLoanSheet(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
      toast.success("Loan created");
    },
    onError: (err) => toast.error(String(err)),
  });
}
