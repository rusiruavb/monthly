import { Check, Upload } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUpdateLoanPayment } from "@/features/loans/hooks/use-update-loan-payment";
import type { Loan, LoanPayment } from "@/features/loans/types/loan";
import { Numeric } from "@/shared/components/numeric";
import { cn } from "@/shared/lib/utils";

interface LoanDetailTableProps {
  loan: Loan;
}

export function LoanDetailTable({ loan }: LoanDetailTableProps) {
  const { toggleMutation, uploadMutation } = useUpdateLoanPayment(loan.id);

  return (
    <>
      {/* Mobile card list */}
      <ul className="space-y-3 lg:hidden">
        {loan.payments.map((payment) => (
          <li key={payment.rowIndex}>
            <PaymentCard
              payment={payment}
              onToggle={() =>
                toggleMutation.mutate({ rowIndex: payment.rowIndex })
              }
              onUpload={(file) =>
                uploadMutation.mutate({ rowIndex: payment.rowIndex, file })
              }
              isToggling={toggleMutation.isPending}
              isUploading={uploadMutation.isPending}
            />
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-lg border border-primary/20 lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="no-print">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loan.payments.map((payment) => (
              <PaymentRow
                key={payment.rowIndex}
                payment={payment}
                onToggle={() =>
                  toggleMutation.mutate({ rowIndex: payment.rowIndex })
                }
                onUpload={(file) =>
                  uploadMutation.mutate({ rowIndex: payment.rowIndex, file })
                }
                isToggling={toggleMutation.isPending}
                isUploading={uploadMutation.isPending}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function PaymentCard({
  payment,
  onToggle,
  onUpload,
  isToggling,
  isUploading,
}: {
  payment: LoanPayment;
  onToggle: () => void;
  onUpload: (file: File) => void;
  isToggling: boolean;
  isUploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isPaid = payment.status === "paid";

  return (
    <div
      className={cn(
        "rounded-lg border border-primary/20 bg-card p-4",
        isPaid && "line-through opacity-70",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono-numeric text-sm text-muted-foreground">
          Month {payment.month}
        </span>
        <span className="text-sm font-medium capitalize">{payment.status}</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <span className="text-muted-foreground">Payment</span>
        <Numeric value={payment.paymentAmount} className="justify-end text-right" />
        <span className="text-muted-foreground">Principal</span>
        <Numeric value={payment.principalAmount} className="justify-end text-right" />
        <span className="text-muted-foreground">Interest</span>
        <Numeric value={payment.interestAmount} className="justify-end text-right" />
        <span className="text-muted-foreground">Remaining</span>
        <Numeric value={payment.remainingBalance} className="justify-end text-right" />
      </div>
      {payment.fileLink ? (
        <a
          href={payment.fileLink}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm text-primary underline"
        >
          {payment.fileName || "View file"}
        </a>
      ) : null}
      <div className="no-print mt-4 flex gap-2">
        <Button
          variant={isPaid ? "secondary" : "default"}
          size="sm"
          className="flex-1"
          onClick={onToggle}
          disabled={isToggling}
        >
          <Check className="mr-1 h-4 w-4" />
          {isPaid ? "Undo" : "Mark paid"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          aria-label="Upload payment file"
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function PaymentRow({
  payment,
  onToggle,
  onUpload,
  isToggling,
  isUploading,
}: {
  payment: LoanPayment;
  onToggle: () => void;
  onUpload: (file: File) => void;
  isToggling: boolean;
  isUploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isPaid = payment.status === "paid";

  return (
    <TableRow className={cn(isPaid && "line-through opacity-70")}>
      <TableCell className="font-mono-numeric">{payment.month}</TableCell>
      <TableCell>
        <Numeric value={payment.paymentAmount} />
      </TableCell>
      <TableCell>
        <Numeric value={payment.principalAmount} />
      </TableCell>
      <TableCell>
        <Numeric value={payment.interestAmount} />
      </TableCell>
      <TableCell>
        <Numeric value={payment.remainingBalance} />
      </TableCell>
      <TableCell>
        {payment.fileLink ? (
          <a
            href={payment.fileLink}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline not-italic no-underline-offset"
            style={{ textDecoration: "underline" }}
          >
            {payment.fileName || "File"}
          </a>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="capitalize">{payment.status}</TableCell>
      <TableCell className="no-print">
        <div className="flex gap-1">
          <Button
            variant={isPaid ? "secondary" : "default"}
            size="sm"
            onClick={onToggle}
            disabled={isToggling}
            aria-label={isPaid ? "Mark as pending" : "Mark as paid"}
          >
            <Check className="h-4 w-4" />
            {isPaid ? "Undo" : "Paid"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            aria-label="Upload payment file"
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
