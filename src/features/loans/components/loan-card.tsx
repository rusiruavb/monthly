import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoanActionsMenu } from "@/features/loans/components/loan-actions-menu";
import type { Loan } from "@/features/loans/types/loan";
import { Numeric } from "@/shared/components/numeric";
import { cn } from "@/shared/lib/utils";

interface LoanCardProps {
  loan: Loan;
}

export function LoanCard({ loan }: LoanCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-colors hover:border-primary/50"
      onClick={() => navigate(`/loans/${encodeURIComponent(loan.id)}`)}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-lg text-primary">{loan.name}</CardTitle>
        <div onClick={(e) => e.stopPropagation()} className="no-print">
          <LoanActionsMenu loan={loan} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant="secondary" className="capitalize">
          {loan.type}
        </Badge>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-muted-foreground">Months</span>
          <span className="font-mono-numeric text-right">{loan.months}</span>
          <span className="text-muted-foreground">Monthly</span>
          <Numeric value={loan.monthlyPayment} className="justify-end text-right" />
          <span className="text-muted-foreground">Progress</span>
          <span className="font-mono-numeric text-right">
            {loan.paidCount} / {loan.months} paid
          </span>
        </div>
        <div
          className={cn(
            "rounded-lg px-3 py-1 text-center text-xs font-medium",
            loan.status === "complete"
              ? "bg-income/10 text-income"
              : "bg-primary/10 text-primary",
          )}
        >
          {loan.status === "complete" ? "Complete" : "Active"}
        </div>
      </CardContent>
    </Card>
  );
}
