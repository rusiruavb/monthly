import { z } from "zod";
import { FINANCE_TYPES } from "@/shared/constants/sheets";

export const transactionSchema = z.object({
  date: z.date({ required_error: "Date is required" }),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  financeType: z.enum(FINANCE_TYPES),
  file: z.instanceof(File).optional().nullable(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
