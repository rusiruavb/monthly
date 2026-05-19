import { z } from "zod";
import { PAYMENT_STATUSES } from "@/shared/constants/sheets";

export const paymentStatusSchema = z.enum(PAYMENT_STATUSES);

export const paymentUploadSchema = z.object({
  file: z.instanceof(File, { message: "File is required" }),
});

export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
