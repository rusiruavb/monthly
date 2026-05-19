import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createLoanRecord } from "@/features/loans/services/create-loan-sheet";
import { LOANS_QUERY_KEY } from "@/features/loans/hooks/use-loans";
import type { LoanFormValues } from "@/features/loans/schemas/loan-schema";

export function useCreateLoan() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (values: LoanFormValues) => createLoanRecord(values),
    onSuccess: (id) => {
      void queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
      toast.success("Loan created");
      navigate(`/loans/${encodeURIComponent(id)}`);
    },
    onError: (err) => toast.error(String(err)),
  });
}
