import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { updateLoanMetadata } from "@/features/loans/services/create-loan-sheet";
import { LOANS_QUERY_KEY } from "@/features/loans/hooks/use-loans";
import type { LoanFormValues } from "@/features/loans/schemas/loan-schema";
import { sanitizeSheetName } from "@/shared/lib/google-api";

export function useUpdateLoan() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({
      tabName,
      values,
    }: {
      tabName: string;
      values: LoanFormValues;
    }) => {
      const newName = sanitizeSheetName(values.name);
      return updateLoanMetadata(tabName, values, newName !== tabName ? newName : undefined);
    },
    onSuccess: (newTab) => {
      void queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["loan"] });
      toast.success("Loan updated");
      navigate(`/loans/${encodeURIComponent(newTab)}`);
    },
    onError: (err) => toast.error(String(err)),
  });
}
