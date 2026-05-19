import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LOANS_QUERY_KEY } from "@/features/loans/hooks/use-loans";
import { deleteLoan } from "@/shared/lib/api";

export function useDeleteLoan() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (loanId: string) => deleteLoan(loanId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
      toast.success("Loan deleted");
      navigate("/loans");
    },
    onError: (err) => toast.error(String(err)),
  });
}
