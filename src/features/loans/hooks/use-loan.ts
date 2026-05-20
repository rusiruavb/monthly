import { useQuery } from "@tanstack/react-query";
import { LOAN_DETAIL_QUERY_KEY_PREFIX } from "@/features/loans/hooks/use-loans";
import { fetchLoanByTab } from "@/features/loans/services/loans-sheets";

export function loanQueryKey(loanId: string) {
  return [...LOAN_DETAIL_QUERY_KEY_PREFIX, loanId] as const;
}

export function useLoan(loanId: string) {
  return useQuery({
    queryKey: loanQueryKey(loanId),
    queryFn: () => fetchLoanByTab(decodeURIComponent(loanId)),
    enabled: !!loanId,
  });
}
