import { z } from "zod";

// Mirrors backend SessionCreate (app/schemas/session.py).
export const createSessionSchema = z.object({
  transaction_type: z.enum(["cash_loan", "goods_on_credit", "service_on_credit", "deposit_to"], {
    message: "Select a transaction type",
  }),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  due_date: z.string().min(1, "Due date is required"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(100, "Description must be at most 100 characters"),
});
export type CreateSessionFormValues = z.infer<typeof createSessionSchema>;

const TRANSACTION_TYPES: Array<{ value: CreateSessionFormValues["transaction_type"]; label: string }> = [
  { value: "cash_loan", label: "Cash Loan" },
  { value: "goods_on_credit", label: "Goods on Credit" },
  { value: "service_on_credit", label: "Service on Credit" },
  { value: "deposit_to", label: "Deposit To" },
];
export { TRANSACTION_TYPES };
