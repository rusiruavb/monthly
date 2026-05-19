import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthlySummary } from "@/features/summary/types/summary";
import { Numeric } from "@/shared/components/numeric";
import { cn } from "@/shared/lib/utils";

interface SummaryCardsProps {
  summary: MonthlySummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Income",
      value: summary.totalIncome,
      className: "text-income",
    },
    {
      title: "Total Expense",
      value: summary.totalExpense,
      className: "text-expense",
    },
    {
      title: "Net Balance",
      value: summary.netBalance,
      className: summary.netBalance >= 0 ? "text-income" : "text-expense",
    },
    {
      title: "Loan Payments Due",
      value: summary.loanPaymentsDue,
      className: "text-primary",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{summary.currentMonth}</p>
          </CardHeader>
          <CardContent>
            <Numeric value={card.value} className={cn("text-2xl", card.className)} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
