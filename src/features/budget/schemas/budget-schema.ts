import { z } from "zod";
import { FINANCE_TYPES } from "@/shared/constants/sheets";

const budgetSection = z.enum(["income", "fixed", "variable", "savings"]);
const amountSource = z.enum(["template", "previous_month"]);
const frequency = z.enum(["monthly", "manual_only"]);

export const recurringItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .nonnegative("Amount cannot be negative")
    .optional(),
  financeType: z.enum(FINANCE_TYPES),
  section: budgetSection,
  itemType: z.enum(["regular", "fixed_deposit"]).optional(),
  fixedDepositDay: z.coerce.number().int().min(1).max(31).optional().nullable(),
  fixedDepositMaturityMonths: z.coerce.number().int().min(1).optional().nullable(),
  fixedDepositInterestRate: z.coerce.number().min(0).max(100).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  amountSource: amountSource.optional(),
  frequency: frequency.optional(),
});

export type RecurringItemFormValues = z.infer<typeof recurringItemSchema>;

export const budgetLineSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  financeType: z.enum(FINANCE_TYPES),
  section: budgetSection,
  plannedDate: z.string().optional().nullable(),
  postToLedger: z.boolean().optional(),
  itemType: z.enum(["regular", "fixed_deposit"]).optional(),
  savingsBucket: z.enum(["savings", "one_off"]).optional(),
  featureCategory: z.string().optional().nullable(),
  fixedDepositDate: z.string().optional().nullable(),
  fixedDepositMaturityMonths: z.coerce.number().int().min(1).optional().nullable(),
  fixedDepositInterestRate: z.coerce.number().min(0).max(100).optional().nullable(),
});

export type BudgetLineFormValues = z.infer<typeof budgetLineSchema>;

export const postToLedgerSchema = z.object({
  date: z.date({ required_error: "Date is required" }),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
});

export type PostToLedgerFormValues = z.infer<typeof postToLedgerSchema>;
