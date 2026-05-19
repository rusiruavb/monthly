import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { IncomeExpensePage } from "@/features/income-expense";
import { LoanDetailPage, LoansPage } from "@/features/loans";
import { SummaryPage } from "@/features/summary";
import { AppLayout } from "@/shared/components/app-layout";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/income-expense" replace />} />
          <Route path="income-expense" element={<IncomeExpensePage />} />
          <Route path="loans" element={<LoansPage />} />
          <Route path="loans/:loanId" element={<LoanDetailPage />} />
          <Route path="summary" element={<SummaryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
