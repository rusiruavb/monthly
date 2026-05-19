import type { LOAN_TYPES, PAYMENT_STATUSES } from "@/shared/constants/sheets";

export type LoanType = (typeof LOAN_TYPES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface LoanPayment {
  rowIndex: number;
  month: string;
  paymentAmount: number;
  principalAmount: number;
  interestAmount: number;
  remainingBalance: number;
  attachedFile: string;
  fileName: string;
  fileLink: string;
  status: PaymentStatus;
}

export interface Loan {
  id: string;
  name: string;
  type: LoanType;
  months: number;
  monthlyPayment: number;
  payments: LoanPayment[];
  paidCount: number;
  status: "active" | "complete";
}
