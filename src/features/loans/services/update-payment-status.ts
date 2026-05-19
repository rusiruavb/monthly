import type { PaymentStatus } from "@/features/loans/types/loan";
import { togglePaymentStatus, uploadPaymentFile } from "@/shared/lib/api";

export async function togglePaymentStatusForLoan(
  loanId: string,
  paymentId: number,
): Promise<PaymentStatus> {
  return togglePaymentStatus(loanId, paymentId);
}

export async function uploadPaymentFileForLoan(
  loanId: string,
  paymentId: number,
  file: File,
): Promise<void> {
  await uploadPaymentFile(loanId, paymentId, file);
}
