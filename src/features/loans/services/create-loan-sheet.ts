import { buildLoanSheetRows } from "@/features/loans/services/loans-sheets";
import type { LoanFormValues } from "@/features/loans/schemas/loan-schema";
import {
  addSheetTab,
  deleteSheetTab,
  readSheet,
  sanitizeSheetName,
  writeSheetRange,
} from "@/shared/lib/google-api";

export async function createLoanSheet(values: LoanFormValues): Promise<string> {
  const tabName = sanitizeSheetName(values.name);
  await addSheetTab(tabName);
  const rows = buildLoanSheetRows(values.type, values.months, values.monthlyPayment);
  await writeSheetRange(tabName, "A1", rows);
  return tabName;
}

export async function updateLoanMetadata(
  tabName: string,
  values: LoanFormValues,
  newTabName?: string,
): Promise<string> {
  const rows = buildLoanSheetRows(values.type, values.months, values.monthlyPayment);
  const current = await readSheet(tabName);
  const currentPayments = current.slice(4);

  const mergedPayments = rows.slice(5).map((row, i) => {
    const existing = currentPayments[i];
    if (!existing) return row;
    return [
      row[0],
      row[1],
      row[2],
      row[3],
      row[4],
      existing[5] ?? "",
      existing[6] ?? "pending",
    ];
  });

  const finalRows = [...rows.slice(0, 5), ...mergedPayments];
  const targetTab = newTabName ?? tabName;

  if (newTabName && newTabName !== tabName) {
    await addSheetTab(newTabName);
    await writeSheetRange(newTabName, "A1", finalRows);
    await deleteSheetTab(tabName);
  } else {
    await writeSheetRange(tabName, "A1", finalRows);
  }

  return targetTab;
}
