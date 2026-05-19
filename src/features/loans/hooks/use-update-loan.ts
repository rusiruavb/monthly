import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { updateLoanRecord } from "@/features/loans/services/create-loan-sheet";
import { LOANS_QUERY_KEY } from "@/features/loans/hooks/use-loans";
import type { LoanFormValues } from "@/features/loans/schemas/loan-schema";

export function useUpdateLoan() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ loanId, values }: { loanId: string; values: LoanFormValues }) =>
      updateLoanRecord(loanId, values),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["loan"] });
      toast.success("Loan updated");
      navigate(`/loans/${encodeURIComponent(result)}`);
    },
    onError: (err) => toast.error(String(err)),
  });
}
