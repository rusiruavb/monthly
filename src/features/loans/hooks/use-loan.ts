import { useQuery } from "@tanstack/react-query";
import { fetchLoanByTab } from "@/features/loans/services/loans-sheets";

export function useLoan(loanId: string) {
  return useQuery({
    queryKey: ["loan", loanId],
    queryFn: () => fetchLoanByTab(decodeURIComponent(loanId)),
    enabled: !!loanId,
  });
}
