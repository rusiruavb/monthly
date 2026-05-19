import { useQuery } from "@tanstack/react-query";
import { fetchAllLoans } from "@/features/loans/services/loans-sheets";

export const LOANS_QUERY_KEY = ["loans"] as const;

export function useLoans() {
  return useQuery({
    queryKey: LOANS_QUERY_KEY,
    queryFn: fetchAllLoans,
  });
}
