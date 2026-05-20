import { getDb } from "./index.js";
import { createTransaction, deleteTransaction, updateTransaction } from "./transactions.js";

export type BudgetSection = "income" | "fixed" | "variable" | "savings";
export type AmountSource = "template" | "previous_month";
export type BudgetFrequency = "monthly" | "manual_only";
export type BudgetLineStatus = "planned" | "paid" | "skipped";
export type BudgetSource = "from_template" | "from_previous_month" | "manual";
export type AmountMode = "template" | "previous_month";
export type BudgetItemType = "regular" | "fixed_deposit";
export type SavingsBucket = "savings" | "one_off";

export type RecurringBudgetItemRow = {
  id: number;
  description: string;
  amount: number;
  finance_type: string;
  section: string;
  item_type: string;
  savings_bucket: string;
  feature_category: string | null;
  fixed_deposit_day: number | null;
  fixed_deposit_maturity_months: number | null;
  fixed_deposit_interest_rate: number | null;
  sort_order: number;
  is_active: number;
  amount_source: string;
  frequency: string;
};

export type MonthlyBudgetRow = {
  id: number;
  year_month: string;
  status: string;
  source: string;
  created_at: string;
};

export type MonthlyBudgetLineRow = {
  id: number;
  monthly_budget_id: number;
  recurring_item_id: number | null;
  description: string;
  amount: number;
  finance_type: string;
  section: string;
  item_type: string;
  savings_bucket: string;
  feature_category: string | null;
  planned_date: string | null;
  fixed_deposit_date: string | null;
  fixed_deposit_maturity_months: number | null;
  fixed_deposit_interest_rate: number | null;
  sort_order: number;
  status: string;
  transaction_id: number | null;
  paid_at: string | null;
};

export type BudgetTotals = {
  incomeTotal: number;
  fixedTotal: number;
  variableTotal: number;
  expenseTotal: number;
  fixedDepositTotal: number;
  savingsTotal: number;
  remaining: number;
};

const SECTION_ORDER: BudgetSection[] = ["income", "fixed", "variable", "savings"];

export function previousYearMonth(yearMonth: string): string | null {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const date = new Date(year, month - 2, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function computeBudgetTotals(lines: MonthlyBudgetLineRow[]): BudgetTotals {
  const sumSection = (section: BudgetSection) =>
    lines
      .filter((l) => l.section === section && l.status !== "skipped")
      .reduce((acc, l) => acc + l.amount, 0);

  const incomeTotal = sumSection("income");
  const fixedTotal = sumSection("fixed");
  const variableTotal = sumSection("variable");
  const savingsLines = lines.filter((l) => l.section === "savings" && l.status !== "skipped");
  const fixedDepositTotal = savingsLines
    .filter((l) => l.item_type === "fixed_deposit")
    .reduce((acc, l) => acc + l.amount, 0);
  const savingsTotal = savingsLines
    .filter((l) => l.item_type !== "fixed_deposit")
    .reduce((acc, l) => acc + l.amount, 0);
  const expenseTotal = fixedTotal + variableTotal;
  const remaining = incomeTotal - expenseTotal - savingsTotal - fixedDepositTotal;

  return {
    incomeTotal,
    fixedTotal,
    variableTotal,
    expenseTotal,
    fixedDepositTotal,
    savingsTotal,
    remaining,
  };
}

export function listRecurringItems(): RecurringBudgetItemRow[] {
  return getDb()
    .prepare(
      `SELECT id, description, amount, finance_type, section,
              item_type, savings_bucket, feature_category,
              fixed_deposit_day, fixed_deposit_maturity_months, fixed_deposit_interest_rate,
              sort_order, is_active, amount_source, frequency
       FROM recurring_budget_items
       ORDER BY section, sort_order, id`,
    )
    .all() as RecurringBudgetItemRow[];
}

export function getRecurringItem(id: number): RecurringBudgetItemRow | undefined {
  return getDb()
    .prepare(
      `SELECT id, description, amount, finance_type, section,
              item_type, savings_bucket, feature_category,
              fixed_deposit_day, fixed_deposit_maturity_months, fixed_deposit_interest_rate,
              sort_order, is_active, amount_source, frequency
       FROM recurring_budget_items WHERE id = ?`,
    )
    .get(id) as RecurringBudgetItemRow | undefined;
}

export function createRecurringItem(data: {
  description: string;
  amount?: number;
  financeType: string;
  section: BudgetSection;
  itemType?: BudgetItemType;
  savingsBucket?: SavingsBucket;
  featureCategory?: string | null;
  fixedDepositDay?: number;
  fixedDepositMaturityMonths?: number;
  fixedDepositInterestRate?: number;
  sortOrder?: number;
  amountSource?: AmountSource;
  frequency?: BudgetFrequency;
}): number {
  const now = new Date().toISOString();
  const maxOrder = getDb()
    .prepare(
      "SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM recurring_budget_items WHERE section = ?",
    )
    .get(data.section) as { max_order: number };

  const result = getDb()
    .prepare(
      `INSERT INTO recurring_budget_items
        (description, amount, finance_type, section,
         item_type, savings_bucket, feature_category,
         fixed_deposit_day, fixed_deposit_maturity_months, fixed_deposit_interest_rate,
         sort_order, is_active, amount_source, frequency, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
    )
    .run(
      data.description,
      data.amount ?? 0,
      data.financeType,
      data.section,
      data.itemType ?? "regular",
      data.savingsBucket ?? "savings",
      data.featureCategory ?? null,
      data.fixedDepositDay ?? null,
      data.fixedDepositMaturityMonths ?? null,
      data.fixedDepositInterestRate ?? null,
      data.sortOrder ?? maxOrder.max_order + 1,
      data.amountSource ?? "template",
      data.frequency ?? "monthly",
      now,
      now,
    );
  return Number(result.lastInsertRowid);
}

export function updateRecurringItem(
  id: number,
  data: {
    description: string;
    amount?: number;
    financeType: string;
    section: BudgetSection;
    itemType: BudgetItemType;
    savingsBucket?: SavingsBucket;
    featureCategory?: string | null;
    fixedDepositDay?: number;
    fixedDepositMaturityMonths?: number;
    fixedDepositInterestRate?: number;
    sortOrder: number;
    isActive: boolean;
    amountSource: AmountSource;
    frequency: BudgetFrequency;
  },
): void {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `UPDATE recurring_budget_items SET
        description = ?, amount = ?, finance_type = ?, section = ?,
        item_type = ?, savings_bucket = ?, feature_category = ?,
        fixed_deposit_day = ?, fixed_deposit_maturity_months = ?, fixed_deposit_interest_rate = ?,
        sort_order = ?, is_active = ?, amount_source = ?, frequency = ?, updated_at = ?
       WHERE id = ?`,
    )
    .run(
      data.description,
      data.amount ?? 0,
      data.financeType,
      data.section,
      data.itemType,
      data.savingsBucket ?? "savings",
      data.featureCategory ?? null,
      data.fixedDepositDay ?? null,
      data.fixedDepositMaturityMonths ?? null,
      data.fixedDepositInterestRate ?? null,
      data.sortOrder,
      data.isActive ? 1 : 0,
      data.amountSource,
      data.frequency,
      now,
      id,
    );
}

export function deleteRecurringItem(id: number): void {
  getDb().prepare("DELETE FROM recurring_budget_items WHERE id = ?").run(id);
}

export function listMonthlyBudgets(): MonthlyBudgetRow[] {
  return getDb()
    .prepare(
      "SELECT id, year_month, status, source, created_at FROM monthly_budgets ORDER BY year_month DESC",
    )
    .all() as MonthlyBudgetRow[];
}

export function getMonthlyBudgetByYearMonth(
  yearMonth: string,
): MonthlyBudgetRow | undefined {
  return getDb()
    .prepare(
      "SELECT id, year_month, status, source, created_at FROM monthly_budgets WHERE year_month = ?",
    )
    .get(yearMonth) as MonthlyBudgetRow | undefined;
}

export function listBudgetLines(monthlyBudgetId: number): MonthlyBudgetLineRow[] {
  return getDb()
    .prepare(
      `SELECT id, monthly_budget_id, recurring_item_id, description, amount, finance_type,
              section, item_type, savings_bucket, feature_category,
              planned_date,
              fixed_deposit_date, fixed_deposit_maturity_months, fixed_deposit_interest_rate,
              sort_order, status, transaction_id, paid_at
       FROM monthly_budget_lines
       WHERE monthly_budget_id = ?
       ORDER BY section, sort_order, id`,
    )
    .all(monthlyBudgetId) as MonthlyBudgetLineRow[];
}

export function getBudgetLine(id: number): MonthlyBudgetLineRow | undefined {
  return getDb()
    .prepare(
      `SELECT id, monthly_budget_id, recurring_item_id, description, amount, finance_type,
              section, item_type, savings_bucket, feature_category,
              planned_date,
              fixed_deposit_date, fixed_deposit_maturity_months, fixed_deposit_interest_rate,
              sort_order, status, transaction_id, paid_at
       FROM monthly_budget_lines WHERE id = ?`,
    )
    .get(id) as MonthlyBudgetLineRow | undefined;
}

function resolveAmount(
  item: RecurringBudgetItemRow,
  amountMode: AmountMode,
  previousByRecurringId: Map<number, number>,
): number {
  const usePrevious =
    amountMode === "previous_month" || item.amount_source === "previous_month";
  if (usePrevious && previousByRecurringId.has(item.id)) {
    return previousByRecurringId.get(item.id)!;
  }
  return item.amount;
}

function clampDayToMonth(yearMonth: string, day: number): string {
  const [y, m] = yearMonth.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const d = Math.max(1, Math.min(day, daysInMonth));
  return `${yearMonth}-${String(d).padStart(2, "0")}`;
}

export function duplicateMonthFromTemplate(
  yearMonth: string,
  amountMode: AmountMode = "template",
): { budgetId: number; lineCount: number } {
  const existing = getMonthlyBudgetByYearMonth(yearMonth);
  if (existing) {
    const err = new Error("Budget already exists for this month") as Error & {
      code: string;
    };
    err.code = "BUDGET_EXISTS";
    throw err;
  }

  const items = listRecurringItems().filter(
    (i) => i.is_active && i.frequency === "monthly",
  );

  const previousByRecurringId = new Map<number, number>();
  const prevMonth = previousYearMonth(yearMonth);
  if (prevMonth && amountMode === "previous_month") {
    const prevBudget = getMonthlyBudgetByYearMonth(prevMonth);
    if (prevBudget) {
      for (const line of listBudgetLines(prevBudget.id)) {
        if (line.recurring_item_id != null) {
          previousByRecurringId.set(line.recurring_item_id, line.amount);
        }
      }
    }
  }

  const now = new Date().toISOString();
  const source: BudgetSource =
    amountMode === "previous_month" ? "from_previous_month" : "from_template";

  const budgetResult = getDb()
    .prepare(
      "INSERT INTO monthly_budgets (year_month, status, source, created_at) VALUES (?, 'active', ?, ?)",
    )
    .run(yearMonth, source, now);
  const budgetId = Number(budgetResult.lastInsertRowid);

  const insertLine = getDb().prepare(
    `INSERT INTO monthly_budget_lines
      (monthly_budget_id, recurring_item_id, description, amount, finance_type, section,
       item_type, savings_bucket, feature_category,
       fixed_deposit_date, fixed_deposit_maturity_months, fixed_deposit_interest_rate,
       sort_order, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planned', ?, ?)`,
  );

  const effectiveMode =
    amountMode === "previous_month" ? "previous_month" : "template";

  for (const item of items) {
    const amount = resolveAmount(item, effectiveMode, previousByRecurringId);
    const itemType = (item.item_type as BudgetItemType) ?? "regular";
    const isFixedDeposit = itemType === "fixed_deposit";
    insertLine.run(
      budgetId,
      item.id,
      item.description,
      amount,
      item.finance_type,
      item.section,
      itemType,
      item.savings_bucket ?? "savings",
      item.feature_category ?? null,
      isFixedDeposit && item.fixed_deposit_day != null
        ? clampDayToMonth(yearMonth, item.fixed_deposit_day)
        : null,
      isFixedDeposit ? item.fixed_deposit_maturity_months : null,
      isFixedDeposit ? item.fixed_deposit_interest_rate : null,
      item.sort_order,
      now,
      now,
    );
  }

  return { budgetId, lineCount: items.length };
}

export function createBudgetLine(
  yearMonth: string,
  data: {
    description: string;
    amount: number;
    financeType: string;
    section: BudgetSection;
    itemType?: BudgetItemType;
    savingsBucket?: SavingsBucket;
    featureCategory?: string | null;
    plannedDate?: string | null;
    fixedDepositDate?: string;
    fixedDepositMaturityMonths?: number;
    fixedDepositInterestRate?: number;
    sortOrder?: number;
  },
): number {
  const budget = getMonthlyBudgetByYearMonth(yearMonth);
  if (!budget) {
    throw new Error("Monthly budget not found");
  }

  const maxOrder = getDb()
    .prepare(
      "SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM monthly_budget_lines WHERE monthly_budget_id = ? AND section = ?",
    )
    .get(budget.id, data.section) as { max_order: number };

  const now = new Date().toISOString();
  const result = getDb()
    .prepare(
      `INSERT INTO monthly_budget_lines
        (monthly_budget_id, recurring_item_id, description, amount, finance_type, section,
         item_type, savings_bucket, feature_category,
         planned_date,
         fixed_deposit_date, fixed_deposit_maturity_months, fixed_deposit_interest_rate,
         sort_order, status, created_at, updated_at)
       VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planned', ?, ?)`,
    )
    .run(
      budget.id,
      data.description,
      data.amount,
      data.financeType,
      data.section,
      data.itemType ?? "regular",
      data.savingsBucket ?? "savings",
      data.featureCategory ?? null,
      data.plannedDate ?? null,
      data.fixedDepositDate ?? null,
      data.fixedDepositMaturityMonths ?? null,
      data.fixedDepositInterestRate ?? null,
      data.sortOrder ?? maxOrder.max_order + 1,
      now,
      now,
    );
  return Number(result.lastInsertRowid);
}

export function updateBudgetLine(
  id: number,
  data: {
    description?: string;
    amount?: number;
    financeType?: string;
    section?: BudgetSection;
    itemType?: BudgetItemType;
    savingsBucket?: SavingsBucket;
    featureCategory?: string | null;
    plannedDate?: string | null;
    fixedDepositDate?: string | null;
    fixedDepositMaturityMonths?: number | null;
    fixedDepositInterestRate?: number | null;
    sortOrder?: number;
    status?: BudgetLineStatus;
  },
): void {
  const existing = getBudgetLine(id);
  if (!existing) throw new Error("Budget line not found");

  const now = new Date().toISOString();
  getDb()
    .prepare(
      `UPDATE monthly_budget_lines SET
        description = ?, amount = ?, finance_type = ?, section = ?,
        item_type = ?, savings_bucket = ?, feature_category = ?,
        planned_date = ?,
        fixed_deposit_date = ?, fixed_deposit_maturity_months = ?, fixed_deposit_interest_rate = ?,
        sort_order = ?, status = ?, updated_at = ?
       WHERE id = ?`,
    )
    .run(
      data.description ?? existing.description,
      data.amount ?? existing.amount,
      data.financeType ?? existing.finance_type,
      data.section ?? existing.section,
      data.itemType ?? existing.item_type,
      data.savingsBucket ?? existing.savings_bucket ?? "savings",
      data.featureCategory ?? existing.feature_category ?? null,
      data.plannedDate ?? existing.planned_date ?? null,
      data.fixedDepositDate ?? existing.fixed_deposit_date,
      data.fixedDepositMaturityMonths ?? existing.fixed_deposit_maturity_months,
      data.fixedDepositInterestRate ?? existing.fixed_deposit_interest_rate,
      data.sortOrder ?? existing.sort_order,
      data.status ?? existing.status,
      now,
      id,
    );
}

export function deleteBudgetLine(id: number): void {
  const line = getBudgetLine(id);
  if (!line) return;
  if (line.transaction_id) {
    throw new Error("Cannot delete a line that has been posted to the ledger");
  }
  getDb().prepare("DELETE FROM monthly_budget_lines WHERE id = ?").run(id);
}

export function postLineToLedger(
  lineId: number,
  data: { date: string; amount?: number },
): number {
  const line = getBudgetLine(lineId);
  if (!line) throw new Error("Budget line not found");
  if (line.transaction_id) throw new Error("Line already posted to ledger");
  if (line.status === "skipped") {
    throw new Error("Cannot post a skipped line");
  }

  const amount = data.amount ?? line.amount;
  const transactionId = createTransaction({
    date: data.date,
    amount,
    description: line.description,
    financeType: line.finance_type,
  });

  const now = new Date().toISOString();
  getDb()
    .prepare(
      `UPDATE monthly_budget_lines SET
        status = 'paid', transaction_id = ?, paid_at = ?, amount = ?, updated_at = ?
       WHERE id = ?`,
    )
    .run(transactionId, now, amount, now, lineId);

  return transactionId;
}

export function updatePostedLineInLedger(
  lineId: number,
  data: { date: string; amount: number; description?: string },
): void {
  const line = getBudgetLine(lineId);
  if (!line) throw new Error("Budget line not found");
  if (!line.transaction_id) throw new Error("Line is not posted to ledger");

  updateTransaction(line.transaction_id, {
    date: data.date,
    amount: data.amount,
    description: data.description ?? line.description,
    financeType: line.finance_type,
    attachmentPath: null,
    attachmentName: null,
  });

  const now = new Date().toISOString();
  getDb()
    .prepare(
      `UPDATE monthly_budget_lines SET
        description = ?, amount = ?, updated_at = ?
       WHERE id = ?`,
    )
    .run(data.description ?? line.description, data.amount, now, lineId);
}

export function removeLineFromLedger(lineId: number): void {
  const line = getBudgetLine(lineId);
  if (!line) throw new Error("Budget line not found");
  if (!line.transaction_id) throw new Error("Line is not posted to ledger");

  // Delete the ledger transaction
  deleteTransaction(line.transaction_id);

  if (line.recurring_item_id == null) {
    // Manual line: remove it completely
    getDb().prepare("DELETE FROM monthly_budget_lines WHERE id = ?").run(lineId);
    return;
  }

  // Template/recurring line: restore to planned and keep the line.
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `UPDATE monthly_budget_lines SET
        status = 'planned', transaction_id = NULL, paid_at = NULL, updated_at = ?
       WHERE id = ?`,
    )
    .run(now, lineId);
}

export function getMonthDetail(yearMonth: string) {
  const budget = getMonthlyBudgetByYearMonth(yearMonth);
  if (!budget) return null;

  const lines = listBudgetLines(budget.id);
  const totals = computeBudgetTotals(lines);

  return {
    budget,
    lines,
    totals,
    sectionOrder: SECTION_ORDER,
  };
}

export function exportBudgetData() {
  return {
    recurringItems: listRecurringItems(),
    monthlyBudgets: listMonthlyBudgets().map((b) => ({
      ...b,
      lines: listBudgetLines(b.id),
    })),
  };
}

export type AnnualBudgetTotals = {
  year: string;
  incomeTotal: number;
  expenseTotal: number;
  savingsTotal: number;
  fixedDepositTotal: number;
  remaining: number;
};

export function getAnnualBudgetTotals(year: string): AnnualBudgetTotals {
  const rows = getDb()
    .prepare(
      `SELECT l.section AS section, l.item_type AS item_type, COALESCE(SUM(l.amount), 0) AS total
       FROM monthly_budget_lines l
       JOIN monthly_budgets b ON b.id = l.monthly_budget_id
       WHERE b.year_month LIKE ? AND l.status != 'skipped'
       GROUP BY l.section, l.item_type`,
    )
    .all(`${year}-%`) as Array<{ section: string; item_type: string; total: number }>;

  const sum = (predicate: (r: { section: string; item_type: string }) => boolean) =>
    rows.filter(predicate).reduce((acc, r) => acc + Number(r.total ?? 0), 0);

  const incomeTotal = sum((r) => r.section === "income");
  const expenseTotal = sum((r) => r.section === "fixed" || r.section === "variable");
  const fixedDepositTotal = sum(
    (r) => r.section === "savings" && r.item_type === "fixed_deposit",
  );
  const savingsTotal = sum(
    (r) => r.section === "savings" && r.item_type !== "fixed_deposit",
  );
  const remaining = incomeTotal - expenseTotal - savingsTotal - fixedDepositTotal;

  return { year, incomeTotal, expenseTotal, savingsTotal, fixedDepositTotal, remaining };
}
