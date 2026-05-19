import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LoanFormDialog } from "@/features/loans/components/loan-form-dialog";
import { LoanGrid } from "@/features/loans/components/loan-grid";
import { useLoans } from "@/features/loans/hooks/use-loans";

export function LoansPage() {
  const { data: loans = [], isLoading, isError, refetch } = useLoans();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary sm:text-2xl">Loans</h1>
          <p className="text-sm text-muted-foreground">
            Manage loans synced as Google Sheet tabs
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="no-print w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create loan
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-expense/30 p-8 text-center">
          <p className="text-expense">Failed to load loans.</p>
          <Button variant="outline" className="mt-4" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && loans.length === 0 && (
        <div className="rounded-lg border border-dashed border-primary/30 p-12 text-center">
          <p className="text-muted-foreground">No loans yet.</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            Create your first loan
          </Button>
        </div>
      )}

      {!isLoading && !isError && loans.length > 0 && <LoanGrid loans={loans} />}

      <LoanFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
