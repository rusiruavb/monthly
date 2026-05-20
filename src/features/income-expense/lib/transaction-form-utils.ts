import { parseISO } from "date-fns";
import type { TransactionFormValues } from "@/features/income-expense/schemas/transaction-schema";

export function transactionToFormValues(t: {
  date: string;
  amount: number;
  description: string;
  financeType: "Income" | "Expense";
  category?: string;
  loanPaymentId?: number | null;
}): TransactionFormValues {
  return {
    date: parseISO(t.date),
    amount: t.amount,
    description: t.description,
    financeType: t.financeType,
    category:
      t.category === "Loans" ||
      t.category === "Income" ||
      t.category === "Fixed expenses" ||
      t.category === "Variable expenses" ||
      t.category === "Savings & one-off"
        ? t.category
        : "Income",
    loanId: null,
    loanPaymentId: t.loanPaymentId ?? null,
    file: null,
  };
}
