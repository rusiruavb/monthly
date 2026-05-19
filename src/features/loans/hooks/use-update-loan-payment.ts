import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  togglePaymentStatus,
  uploadPaymentFile,
} from "@/features/loans/services/update-payment-status";
import type { PaymentStatus } from "@/features/loans/types/loan";

export function useUpdateLoanPayment(loanId: string) {
  const queryClient = useQueryClient();
  const tabName = decodeURIComponent(loanId);

  const toggleMutation = useMutation({
    mutationFn: ({
      rowIndex,
      currentStatus,
    }: {
      rowIndex: number;
      currentStatus: PaymentStatus;
    }) => togglePaymentStatus(tabName, rowIndex, currentStatus),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["loan", loanId] });
      void queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: (err) => toast.error(String(err)),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ rowIndex, file }: { rowIndex: number; file: File }) =>
      uploadPaymentFile(tabName, rowIndex, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["loan", loanId] });
      toast.success("File uploaded");
    },
    onError: (err) => toast.error(String(err)),
  });

  return { toggleMutation, uploadMutation };
}
