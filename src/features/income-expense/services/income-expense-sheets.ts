import type { Transaction, FinanceType } from "@/features/income-expense/types/transaction";
import {
  INCOME_EXPENSE_HEADERS,
  INCOME_EXPENSE_TAB,
} from "@/shared/constants/sheets";
import {
  appendRow,
  deleteRow,
  parseAttachedFile,
  readSheet,
  updateRow,
  uploadFile,
  writeSheetRange,
} from "@/shared/lib/google-api";
import { parseAmount } from "@/shared/lib/utils";
import { format } from "date-fns";

function rowToTransaction(row: string[], rowIndex: number): Transaction {
  const { name, link } = parseAttachedFile(row[4] ?? "");
  return {
    rowIndex,
    date: row[0] ?? "",
    amount: parseAmount(row[1] ?? "0"),
    description: row[2] ?? "",
    financeType: (row[3] as FinanceType) ?? "Expense",
    driveLink: link,
    fileName: name,
  };
}

export async function ensureIncomeExpenseTab(): Promise<void> {
  const rows = await readSheet(INCOME_EXPENSE_TAB).catch(() => []);
  if (rows.length === 0) {
    await writeSheetRange(INCOME_EXPENSE_TAB, "A1", [[...INCOME_EXPENSE_HEADERS]]);
  }
}

export async function fetchTransactions(): Promise<Transaction[]> {
  await ensureIncomeExpenseTab();
  const rows = await readSheet(INCOME_EXPENSE_TAB);
  if (rows.length <= 1) return [];
  return rows.slice(1).map((row, i) => rowToTransaction(row, i + 2));
}

export async function addTransaction(
  data: {
    date: Date;
    amount: number;
    description: string;
    financeType: FinanceType;
    file?: File | null;
  },
): Promise<void> {
  await ensureIncomeExpenseTab();
  let driveLink = "";
  if (data.file) {
    const uploaded = await uploadFile(data.file);
    driveLink = uploaded.link;
  }
  await appendRow(INCOME_EXPENSE_TAB, [
    format(data.date, "yyyy-MM-dd"),
    String(data.amount),
    data.description,
    data.financeType,
    driveLink,
  ]);
}

export async function updateTransaction(
  rowIndex: number,
  data: {
    date: Date;
    amount: number;
    description: string;
    financeType: FinanceType;
    file?: File | null;
    existingLink?: string;
  },
): Promise<void> {
  let driveLink = data.existingLink ?? "";
  if (data.file) {
    const uploaded = await uploadFile(data.file);
    driveLink = uploaded.link;
  }
  await updateRow(INCOME_EXPENSE_TAB, rowIndex, [
    format(data.date, "yyyy-MM-dd"),
    String(data.amount),
    data.description,
    data.financeType,
    driveLink,
  ]);
}

export async function removeTransaction(rowIndex: number): Promise<void> {
  await deleteRow(INCOME_EXPENSE_TAB, rowIndex);
}
