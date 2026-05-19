import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoanActionsMenu } from "@/features/loans/components/loan-actions-menu";
import { LoanDetailTable } from "@/features/loans/components/loan-detail-table";
import { useLoan } from "@/features/loans/hooks/use-loan";
import { Numeric } from "@/shared/components/numeric";
import "@/shared/styles/print.css";

export function LoanDetailPage() {
  const { loanId = "" } = useParams();
  const { data: loan, isLoading, isError, refetch } = useLoan(loanId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !loan) {
    return (
      <div className="rounded-lg border border-expense/30 p-8 text-center">
        <p className="text-expense">Loan not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => void refetch()}>
          Retry
        </Button>
        <Button variant="link" asChild className="mt-2 block">
          <Link to="/loans">Back to loans</Link>
        </Button>
      </div>
    );
  }

  const totalPaid = loan.payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.paymentAmount, 0);

  return (
    <div className="loan-print-area space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-3 no-print sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <Button variant="ghost" asChild>
          <Link to="/loans">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <LoanActionsMenu loan={loan} />
      </div>

      <div>
        <h1 className="text-xl font-semibold text-primary sm:text-2xl">{loan.name}</h1>
        <Badge variant="secondary" className="mt-2 capitalize">
          {loan.type}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total months
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-mono-numeric text-2xl">{loan.months}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Numeric value={loan.monthlyPayment} className="text-2xl" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-mono-numeric text-2xl">
              {loan.paidCount} / {loan.months}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Numeric value={totalPaid} className="text-2xl text-income" />
          </CardContent>
        </Card>
      </div>

      <LoanDetailTable loan={loan} />
    </div>
  );
}
