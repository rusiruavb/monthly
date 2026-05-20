import { getDb } from "./index.js";
import { deleteAttachment } from "./attachments.js";

export type TransactionRow = {
  id: number;
  date: string;
  amount: number;
  description: string;
  finance_type: string;
  category: string | null;
  loan_payment_id: number | null;
  attachment_path: string | null;
  attachment_name: string | null;
};

export function listTransactions(): TransactionRow[] {
  return getDb()
    .prepare(
      `SELECT id, date, amount, description, finance_type, category, loan_payment_id, attachment_path, attachment_name
       FROM transactions ORDER BY date DESC, id DESC`,
    )
    .all() as TransactionRow[];
}

export function getTransaction(id: number): TransactionRow | undefined {
  return getDb()
    .prepare(
      `SELECT id, date, amount, description, finance_type, category, loan_payment_id, attachment_path, attachment_name
       FROM transactions WHERE id = ?`,
    )
    .get(id) as TransactionRow | undefined;
}

export function createTransaction(data: {
  date: string;
  amount: number;
  description: string;
  financeType: string;
  category?: string | null;
  loanPaymentId?: number | null;
  attachmentPath?: string | null;
  attachmentName?: string | null;
}): number {
  const now = new Date().toISOString();
  const result = getDb()
    .prepare(
      `INSERT INTO transactions (date, amount, description, finance_type, category, loan_payment_id, attachment_path, attachment_name, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      data.date,
      data.amount,
      data.description,
      data.financeType,
      data.category ?? null,
      data.loanPaymentId ?? null,
      data.attachmentPath ?? null,
      data.attachmentName ?? null,
      now,
      now,
    );
  return Number(result.lastInsertRowid);
}

export function updateTransaction(
  id: number,
  data: {
    date: string;
    amount: number;
    description: string;
    financeType: string;
    category?: string | null;
    loanPaymentId?: number | null;
    attachmentPath?: string | null;
    attachmentName?: string | null;
  },
): void {
  const existing = getTransaction(id);
  if (existing?.attachment_path && existing.attachment_path !== data.attachmentPath) {
    deleteAttachment(existing.attachment_path);
  }
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `UPDATE transactions SET
        date = ?, amount = ?, description = ?, finance_type = ?,
        category = ?, loan_payment_id = ?,
        attachment_path = ?, attachment_name = ?, updated_at = ?
       WHERE id = ?`,
    )
    .run(
      data.date,
      data.amount,
      data.description,
      data.financeType,
      data.category ?? existing?.category ?? null,
      data.loanPaymentId ?? existing?.loan_payment_id ?? null,
      data.attachmentPath ?? null,
      data.attachmentName ?? null,
      now,
      id,
    );
}

export function deleteTransaction(id: number): void {
  const existing = getTransaction(id);
  deleteAttachment(existing?.attachment_path);
  getDb().prepare("DELETE FROM transactions WHERE id = ?").run(id);
}
