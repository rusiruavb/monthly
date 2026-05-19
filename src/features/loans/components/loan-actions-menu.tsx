import {
  Download,
  Eye,
  Mail,
  MoreVertical,
  Pencil,
  Printer,
  Share2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoanFormDialog } from "@/features/loans/components/loan-form-dialog";
import { useDeleteLoan } from "@/features/loans/hooks/use-delete-loan";
import type { Loan } from "@/features/loans/types/loan";
import { getSpreadsheetUrl } from "@/shared/lib/google-api";
import { formatCurrency } from "@/shared/lib/utils";

interface LoanActionsMenuProps {
  loan: Loan;
}

export function LoanActionsMenu({ loan }: LoanActionsMenuProps) {
  const navigate = useNavigate();
  const deleteMutation = useDeleteLoan();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const downloadCsv = () => {
    const headers = [
      "month",
      "payment amount",
      "principal amount",
      "interest amount",
      "remaining balance",
      "attached file",
      "status",
    ];
    const rows = loan.payments.map((p) =>
      [
        p.month,
        p.paymentAmount,
        p.principalAmount,
        p.interestAmount,
        p.remainingBalance,
        p.attachedFile,
        p.status,
      ].join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${loan.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  const printLoan = () => {
    window.print();
  };

  const emailLoan = () => {
    const totalPaid = loan.payments
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + p.paymentAmount, 0);
    const body = encodeURIComponent(
      `Loan: ${loan.name}\nType: ${loan.type}\nMonths: ${loan.months}\nMonthly: ${formatCurrency(loan.monthlyPayment)}\nPaid: ${loan.paidCount}/${loan.months}\nTotal paid: ${formatCurrency(totalPaid)}`,
    );
    window.location.href = `mailto:?subject=${encodeURIComponent(`Loan summary: ${loan.name}`)}&body=${body}`;
  };

  const shareLoan = async () => {
    try {
      const url =
        import.meta.env.VITE_SPREADSHEET_URL ?? (await getSpreadsheetUrl());
      await navigator.clipboard.writeText(url);
      toast.success("Spreadsheet link copied");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Loan actions">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate(`/loans/${encodeURIComponent(loan.id)}`)}>
            <Eye className="mr-2 h-4 w-4" /> View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={downloadCsv}>
            <Download className="mr-2 h-4 w-4" /> Download
          </DropdownMenuItem>
          <DropdownMenuItem onClick={printLoan}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </DropdownMenuItem>
          <DropdownMenuItem onClick={emailLoan}>
            <Mail className="mr-2 h-4 w-4" /> Email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void shareLoan()}>
            <Share2 className="mr-2 h-4 w-4" /> Share
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-expense" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LoanFormDialog open={editOpen} onOpenChange={setEditOpen} loan={loan} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete loan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the &quot;{loan.name}&quot; sheet tab permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-expense"
              onClick={() => deleteMutation.mutate(loan.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
