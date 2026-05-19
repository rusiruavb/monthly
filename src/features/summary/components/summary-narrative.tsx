import type { MonthlySummary } from "@/features/summary/types/summary";
import { formatCurrency } from "@/shared/lib/utils";

interface SummaryNarrativeProps {
  summary: MonthlySummary;
  variant: "trend" | "ratio" | "loans";
}

export function SummaryNarrative({ summary, variant }: SummaryNarrativeProps) {
  const { currentMonth, totalIncome, totalExpense, netBalance, loanPaymentsDue } =
    summary;

  if (variant === "trend") {
    return (
      <p className="text-sm text-muted-foreground">
        In <strong>{currentMonth}</strong>, you earned{" "}
        <span className="font-mono-numeric text-income">{formatCurrency(totalIncome)}</span>{" "}
        and spent{" "}
        <span className="font-mono-numeric text-expense">{formatCurrency(totalExpense)}</span>.
        Net:{" "}
        <span
          className={`font-mono-numeric ${netBalance >= 0 ? "text-income" : "text-expense"}`}
        >
          {formatCurrency(netBalance)}
        </span>
        .
      </p>
    );
  }

  if (variant === "ratio") {
    const total = totalIncome + totalExpense;
    const incomePct = total > 0 ? Math.round((totalIncome / total) * 100) : 0;
    return (
      <p className="text-sm text-muted-foreground">
        This month, income accounts for{" "}
        <span className="font-mono-numeric text-income">{incomePct}%</span> of your
        tracked cash flow ({formatCurrency(totalIncome)} income vs{" "}
        {formatCurrency(totalExpense)} expenses).
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      In <strong>{currentMonth}</strong>, you have{" "}
      <span className="font-mono-numeric text-primary">
        {formatCurrency(loanPaymentsDue)}
      </span>{" "}
      in upcoming loan payments across your active loans.
    </p>
  );
}
