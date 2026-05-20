import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  togglePaymentStatusForLoan,
  uploadPaymentFileForLoan,
} from "@/features/loans/services/update-payment-status";
import { invalidateLoanQueries } from "@/features/loans/hooks/use-loans";
import { loanQueryKey } from "@/features/loans/hooks/use-loan";

export function useUpdateLoanPayment(loanId: string) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: ({ rowIndex }: { rowIndex: number }) =>
      togglePaymentStatusForLoan(loanId, rowIndex),
    onSuccess: () => {
      invalidateLoanQueries(queryClient);
    },
    onError: (err) => toast.error(String(err)),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ rowIndex, file }: { rowIndex: number; file: File }) =>
      uploadPaymentFileForLoan(loanId, rowIndex, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: loanQueryKey(loanId) });
      toast.success("File uploaded");
    },
    onError: (err) => toast.error(String(err)),
  });

  return { toggleMutation, uploadMutation };
}
