import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IncomeExpenseRatioChart } from "@/features/summary/components/income-expense-ratio-chart";
import { LoanPaymentsChart } from "@/features/summary/components/loan-payments-chart";
import { MonthlyTrendChart } from "@/features/summary/components/monthly-trend-chart";
import { SummaryCards } from "@/features/summary/components/summary-cards";
import { SummaryNarrative } from "@/features/summary/components/summary-narrative";
import { useMonthlySummary } from "@/features/summary/hooks/use-monthly-summary";

export function SummaryPage() {
  const { data: summary, isLoading, isError, refetch } = useMonthlySummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="rounded-lg border border-expense/30 p-8 text-center">
        <p className="text-expense">Failed to load summary.</p>
        <Button variant="outline" className="mt-4" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-primary sm:text-2xl">Monthly Summary</h1>
        <p className="text-sm text-muted-foreground">
          At-a-glance view for {summary.currentMonth}
        </p>
      </div>

      <SummaryCards summary={summary} />

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Income vs Expense (12 months)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MonthlyTrendChart data={summary.monthlyTrend} />
          <SummaryNarrative summary={summary} variant="trend" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Income vs Expense Ratio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <IncomeExpenseRatioChart data={summary.incomeVsExpenseRatio} />
          <SummaryNarrative summary={summary} variant="ratio" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Loan Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoanPaymentsChart data={summary.monthlyTrend} />
          <SummaryNarrative summary={summary} variant="loans" />
        </CardContent>
      </Card>
    </div>
  );
}
