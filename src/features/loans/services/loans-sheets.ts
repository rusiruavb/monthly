import type { Loan } from "@/features/loans/types/loan";
import { fetchAllLoans, fetchLoanById } from "@/shared/lib/api";

export async function fetchLoanTabs(): Promise<string[]> {
  const loans = await fetchAllLoans();
  return loans.map((l) => l.id);
}

export async function fetchLoanByTab(loanId: string): Promise<Loan> {
  return fetchLoanById(loanId);
}

export async function fetchAllLoansList(): Promise<Loan[]> {
  return fetchAllLoans();
}

export { fetchAllLoans };
