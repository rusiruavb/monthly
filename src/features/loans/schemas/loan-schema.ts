import { z } from "zod";
import { LOAN_TYPES } from "@/shared/constants/sheets";

export const loanSchema = z.object({
  name: z.string().min(1, "Loan name is required").max(100),
  type: z.enum(LOAN_TYPES),
  months: z.coerce.number().int().positive("Months must be at least 1"),
  monthlyPayment: z.coerce.number().positive("Monthly payment must be greater than 0"),
});

export type LoanFormValues = z.infer<typeof loanSchema>;
