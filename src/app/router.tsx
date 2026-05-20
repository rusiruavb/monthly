import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { BudgetPage } from "@/features/budget";
import { LoanDetailPage, LoansPage } from "@/features/loans";
import { SummaryPage } from "@/features/summary";
import { AppLayout } from "@/shared/components/app-layout";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/monthly" replace />} />
          <Route path="monthly" element={<BudgetPage />} />

          {/* Back-compat routes */}
          <Route path="budget" element={<Navigate to="/monthly" replace />} />
          <Route
            path="income-expense"
            element={<Navigate to="/monthly?tab=ledger" replace />}
          />

          <Route path="loans" element={<LoansPage />} />
          <Route path="loans/:loanId" element={<LoanDetailPage />} />
          <Route path="summary" element={<SummaryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
