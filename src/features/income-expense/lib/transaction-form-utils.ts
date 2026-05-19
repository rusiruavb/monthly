import { parseISO } from "date-fns";
import type { TransactionFormValues } from "@/features/income-expense/schemas/transaction-schema";

export function transactionToFormValues(t: {
  date: string;
  amount: number;
  description: string;
  financeType: "Income" | "Expense";
}): TransactionFormValues {
  return {
    date: parseISO(t.date),
    amount: t.amount,
    description: t.description,
    financeType: t.financeType,
    file: null,
  };
}
