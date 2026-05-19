import type { LoanFormValues } from "@/features/loans/schemas/loan-schema";
import { createLoan, sanitizeName, updateLoan } from "@/shared/lib/api";

export async function createLoanRecord(values: LoanFormValues): Promise<string> {
  const name = sanitizeName(values.name);
  const { id } = await createLoan({
    name,
    type: values.type,
    months: values.months,
    monthlyPayment: values.monthlyPayment,
  });
  return id;
}

export async function updateLoanRecord(
  loanId: string,
  values: LoanFormValues,
): Promise<string> {
  const name = sanitizeName(values.name);
  const { id } = await updateLoan(loanId, {
    name,
    type: values.type,
    months: values.months,
    monthlyPayment: values.monthlyPayment,
  });
  return id;
}
