import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  togglePaymentStatusForLoan,
  uploadPaymentFileForLoan,
} from "@/features/loans/services/update-payment-status";
export function useUpdateLoanPayment(loanId: string) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: ({ rowIndex }: { rowIndex: number }) =>
      togglePaymentStatusForLoan(loanId, rowIndex),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["loan", loanId] });
      void queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: (err) => toast.error(String(err)),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ rowIndex, file }: { rowIndex: number; file: File }) =>
      uploadPaymentFileForLoan(loanId, rowIndex, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["loan", loanId] });
      toast.success("File uploaded");
    },
    onError: (err) => toast.error(String(err)),
  });

  return { toggleMutation, uploadMutation };
}
