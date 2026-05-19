import type { PaymentStatus } from "@/features/loans/types/loan";
import {
  formatAttachedFile,
  readSheet,
  updateRow,
  uploadFile,
} from "@/shared/lib/google-api";

export async function togglePaymentStatus(
  tabName: string,
  rowIndex: number,
  currentStatus: PaymentStatus,
): Promise<PaymentStatus> {
  const rows = await readSheet(tabName);
  const row = rows[rowIndex - 1];
  if (!row) throw new Error("Payment row not found");
  const newStatus: PaymentStatus = currentStatus === "paid" ? "pending" : "paid";
  row[6] = newStatus;
  await updateRow(tabName, rowIndex, row);
  return newStatus;
}

export async function uploadPaymentFile(
  tabName: string,
  rowIndex: number,
  file: File,
): Promise<void> {
  const uploaded = await uploadFile(file);
  const rows = await readSheet(tabName);
  const row = rows[rowIndex - 1];
  if (!row) throw new Error("Payment row not found");
  row[5] = formatAttachedFile(uploaded.name, uploaded.link);
  await updateRow(tabName, rowIndex, row);
}
