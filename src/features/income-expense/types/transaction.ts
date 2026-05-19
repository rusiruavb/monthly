import type { FINANCE_TYPES } from "@/shared/constants/sheets";

export type FinanceType = (typeof FINANCE_TYPES)[number];

export interface Transaction {
  rowIndex: number;
  date: string;
  amount: number;
  description: string;
  financeType: FinanceType;
  driveLink: string;
  fileName: string;
}
