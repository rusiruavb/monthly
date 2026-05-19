export const INCOME_EXPENSE_TAB = "Income_Expense";

export const INCOME_EXPENSE_HEADERS = [
  "date",
  "amount",
  "description",
  "finance type",
  "google drive link",
] as const;

export const LOAN_PAYMENT_HEADERS = [
  "month",
  "payment amount",
  "principal amount",
  "interest amount",
  "remaining balance",
  "attached file",
  "status",
] as const;

export const LOAN_METADATA_KEYS = {
  type: "type",
  months: "months",
  monthlyPayment: "monthly_payment",
} as const;

export const LOAN_METADATA_ROW_COUNT = 3;
export const LOAN_HEADER_ROW = 5;
export const LOAN_DATA_START_ROW = 6;

export const RESERVED_TABS = [INCOME_EXPENSE_TAB] as const;

export const FINANCE_TYPES = ["Income", "Expense"] as const;
export const LOAN_TYPES = ["finance", "bank", "family"] as const;
export const PAYMENT_STATUSES = ["pending", "paid"] as const;
