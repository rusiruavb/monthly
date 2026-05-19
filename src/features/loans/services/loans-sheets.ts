import type { Loan, LoanPayment, LoanType, PaymentStatus } from "@/features/loans/types/loan";
import {
  LOAN_DATA_START_ROW,
  LOAN_HEADER_ROW,
  LOAN_METADATA_KEYS,
  LOAN_PAYMENT_HEADERS,
  RESERVED_TABS,
} from "@/shared/constants/sheets";
import {
  listSheetTabs,
  parseAttachedFile,
  readSheet,
  sanitizeSheetName,
} from "@/shared/lib/google-api";
import { parseAmount } from "@/shared/lib/utils";

function parseMetadata(rows: string[][]): {
  type: LoanType;
  months: number;
  monthlyPayment: number;
} {
  const map = new Map<string, string>();
  for (let i = 0; i < 3; i++) {
    const row = rows[i];
    if (row?.[0] && row[1]) map.set(row[0], row[1]);
  }
  return {
    type: (map.get(LOAN_METADATA_KEYS.type) as LoanType) ?? "bank",
    months: Number.parseInt(map.get(LOAN_METADATA_KEYS.months) ?? "0", 10),
    monthlyPayment: parseAmount(map.get(LOAN_METADATA_KEYS.monthlyPayment) ?? "0"),
  };
}

function parsePayment(row: string[], rowIndex: number): LoanPayment {
  const { name, link } = parseAttachedFile(row[5] ?? "");
  return {
    rowIndex,
    month: row[0] ?? "",
    paymentAmount: parseAmount(row[1] ?? "0"),
    principalAmount: parseAmount(row[2] ?? "0"),
    interestAmount: parseAmount(row[3] ?? "0"),
    remainingBalance: parseAmount(row[4] ?? "0"),
    attachedFile: row[5] ?? "",
    fileName: name,
    fileLink: link,
    status: (row[6]?.toLowerCase() as PaymentStatus) ?? "pending",
  };
}

export async function fetchLoanTabs(): Promise<string[]> {
  const tabs = await listSheetTabs();
  return tabs.filter((t) => !RESERVED_TABS.includes(t as (typeof RESERVED_TABS)[number]));
}

export async function fetchLoanByTab(tabName: string): Promise<Loan> {
  const rows = await readSheet(tabName);
  const meta = parseMetadata(rows.slice(0, 3));
  const payments = rows
    .slice(LOAN_DATA_START_ROW - 1)
    .filter((row) => row[0])
    .map((row, i) => parsePayment(row, LOAN_DATA_START_ROW + i));
  const paidCount = payments.filter((p) => p.status === "paid").length;
  return {
    id: tabName,
    name: tabName,
    type: meta.type,
    months: meta.months,
    monthlyPayment: meta.monthlyPayment,
    payments,
    paidCount,
    status: paidCount === meta.months && meta.months > 0 ? "complete" : "active",
  };
}

export async function fetchAllLoans(): Promise<Loan[]> {
  const tabs = await fetchLoanTabs();
  return Promise.all(tabs.map((tab) => fetchLoanByTab(tab)));
}

export function buildLoanSheetRows(
  type: LoanType,
  months: number,
  monthlyPayment: number,
): string[][] {
  const metadata: string[][] = [
    [LOAN_METADATA_KEYS.type, type],
    [LOAN_METADATA_KEYS.months, String(months)],
    [LOAN_METADATA_KEYS.monthlyPayment, String(monthlyPayment)],
    [],
    [...LOAN_PAYMENT_HEADERS],
  ];

  const paymentRows: string[][] = [];
  for (let m = 1; m <= months; m++) {
    const remaining = (months - m) * monthlyPayment;
    paymentRows.push([
      `Month ${m}`,
      String(monthlyPayment),
      String(monthlyPayment),
      "0",
      String(remaining),
      "",
      "pending",
    ]);
  }

  return [...metadata, ...paymentRows];
}

export { sanitizeSheetName, LOAN_HEADER_ROW };
