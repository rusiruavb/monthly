import { useQuery, type QueryClient } from "@tanstack/react-query";
import { fetchAllLoans } from "@/features/loans/services/loans-sheets";

export const LOANS_QUERY_KEY = ["loans"] as const;
export const LOAN_DETAIL_QUERY_KEY_PREFIX = ["loan"] as const;

/** Invalidate list + every open loan detail after ledger or payment changes. */
export function invalidateLoanQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: LOAN_DETAIL_QUERY_KEY_PREFIX });
}

export function useLoans() {
  return useQuery({
    queryKey: LOANS_QUERY_KEY,
    queryFn: fetchAllLoans,
  });
}
