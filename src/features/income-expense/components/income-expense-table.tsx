import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TransactionFilterSortMenu } from "@/features/income-expense/components/transaction-filter-sort-menu";
import { useDeleteTransaction } from "@/features/income-expense/hooks/use-delete-transaction";
import { useIncomeExpenses } from "@/features/income-expense/hooks/use-income-expenses";
import { useUpdateTransaction } from "@/features/income-expense/hooks/use-update-transaction";
import {
  transactionSchema,
  type TransactionFormValues,
} from "@/features/income-expense/schemas/transaction-schema";
import type { Transaction } from "@/features/income-expense/types/transaction";
import { transactionToFormValues } from "@/features/income-expense/lib/transaction-form-utils";
import {
  applyTransactionQuery,
  DEFAULT_TRANSACTION_FILTERS,
  DEFAULT_TRANSACTION_SORT,
  type TransactionFilters,
  type TransactionSort,
} from "@/features/income-expense/lib/transaction-table-query";
import { FINANCE_TYPES } from "@/shared/constants/sheets";
import { DatePickerField } from "@/shared/components/date-picker-field";
import { DateText } from "@/shared/components/date-text";
import { FileUpload } from "@/shared/components/file-upload";
import { Numeric } from "@/shared/components/numeric";
import { cn } from "@/shared/lib/utils";

export function IncomeExpenseTable() {
  const { data = [], isLoading, isError, refetch } = useIncomeExpenses();
  const deleteMutation = useDeleteTransaction();
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_TRANSACTION_FILTERS);
  const [sort, setSort] = useState<TransactionSort>(DEFAULT_TRANSACTION_SORT);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const filtered = useMemo(
    () => applyTransactionQuery(data, filters, sort),
    [data, filters, sort],
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-expense/30 p-8 text-center">
        <p className="text-expense">Failed to load transactions.</p>
        <Button variant="outline" className="mt-4" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end">
        <TransactionFilterSortMenu
          filters={filters}
          sort={sort}
          onFiltersChange={setFilters}
          onSortChange={setSort}
        />
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-primary/20 py-12 text-center text-muted-foreground">
            No transactions match your filters.
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((row) => (
              <li
                key={row.rowIndex}
                className="rounded-lg border border-primary/20 bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <DateText value={row.date} className="text-sm text-muted-foreground" />
                    <p className="font-medium leading-snug">{row.description}</p>
                  </div>
                  <Numeric
                    value={row.amount}
                    className={cn(
                      "shrink-0 text-lg font-semibold",
                      row.financeType === "Income" ? "text-income" : "text-expense",
                    )}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <Badge variant={row.financeType === "Income" ? "income" : "expense"}>
                    {row.financeType}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit transaction"
                      onClick={() => setEditing(row)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete transaction"
                      onClick={() => setDeleting(row)}
                    >
                      <Trash2 className="h-4 w-4 text-expense" />
                    </Button>
                  </div>
                </div>
                {row.driveLink ? (
                  <a
                    href={row.driveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm text-primary underline"
                  >
                    {row.fileName || "View file"}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-lg border border-primary/20 lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Attached File</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No transactions match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow key={row.rowIndex}>
                  <TableCell>
                    <DateText value={row.date} />
                  </TableCell>
                  <TableCell>
                    <Numeric
                      value={row.amount}
                      className={cn(
                        row.financeType === "Income" ? "text-income" : "text-expense",
                      )}
                    />
                  </TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>
                    <Badge variant={row.financeType === "Income" ? "income" : "expense"}>
                      {row.financeType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.driveLink ? (
                      <a
                        href={row.driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        {row.fileName || "View file"}
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit transaction"
                        onClick={() => setEditing(row)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete transaction"
                        onClick={() => setDeleting(row)}
                      >
                        <Trash2 className="h-4 w-4 text-expense" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <EditTransactionDialog transaction={editing} onClose={() => setEditing(null)} />
      )}

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the row from your Google Sheet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-expense"
              onClick={() => {
                if (deleting) deleteMutation.mutate(deleting.rowIndex);
                setDeleting(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function EditTransactionDialog({
  transaction,
  onClose,
}: {
  transaction: Transaction;
  onClose: () => void;
}) {
  const updateMutation = useUpdateTransaction();
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transactionToFormValues(transaction),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit transaction</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) =>
              updateMutation.mutate(
                {
                  rowIndex: transaction.rowIndex,
                  data: values,
                  existingLink: transaction.driveLink,
                },
                { onSuccess: onClose },
              ),
            )}
          >
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <DatePickerField value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" className="font-mono-numeric" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="financeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FINANCE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New file (optional)</FormLabel>
                  <FileUpload selectedFile={field.value} onFileSelect={field.onChange} />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={updateMutation.isPending}>
              Save
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
