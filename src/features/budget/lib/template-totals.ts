import type { BudgetSection, RecurringBudgetItem } from "@/features/budget/types/budget";

export function isActiveMonthlyItem(item: RecurringBudgetItem): boolean {
  return item.isActive && item.frequency === "monthly" && item.amount > 0;
}

export function sectionMonthlyTotal(
  items: RecurringBudgetItem[],
  section: BudgetSection,
): number {
  return items
    .filter((item) => item.section === section && isActiveMonthlyItem(item))
    .reduce((sum, item) => sum + item.amount, 0);
}

export type TemplateTotals = {
  incomeTotal: number;
  fixedTotal: number;
  variableTotal: number;
  savingsTotal: number;
  fixedDepositTotal: number;
  expenseTotal: number;
  remaining: number;
};

export function computeTemplateTotals(items: RecurringBudgetItem[]): TemplateTotals {
  const incomeTotal = sectionMonthlyTotal(items, "income");
  const fixedTotal = sectionMonthlyTotal(items, "fixed");
  const variableTotal = sectionMonthlyTotal(items, "variable");
  const activeSavings = items.filter(
    (item) => item.section === "savings" && isActiveMonthlyItem(item),
  );
  const fixedDepositTotal = activeSavings
    .filter((i) => i.itemType === "fixed_deposit")
    .reduce((sum, i) => sum + i.amount, 0);
  const savingsTotal = activeSavings
    .filter((i) => i.itemType !== "fixed_deposit")
    .reduce((sum, i) => sum + i.amount, 0);

  const expenseTotal = fixedTotal + variableTotal;
  const remaining = incomeTotal - expenseTotal - savingsTotal - fixedDepositTotal;

  return {
    incomeTotal,
    fixedTotal,
    variableTotal,
    savingsTotal,
    fixedDepositTotal,
    expenseTotal,
    remaining,
  };
}
