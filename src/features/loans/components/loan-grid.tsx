import { LoanCard } from "@/features/loans/components/loan-card";
import type { Loan } from "@/features/loans/types/loan";

interface LoanGridProps {
  loans: Loan[];
}

export function LoanGrid({ loans }: LoanGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {loans.map((loan) => (
        <LoanCard key={loan.id} loan={loan} />
      ))}
    </div>
  );
}
