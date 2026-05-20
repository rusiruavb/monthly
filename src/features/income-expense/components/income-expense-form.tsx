import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { useAddTransaction } from "@/features/income-expense/hooks/use-add-transaction";
import {
  transactionSchema,
  TRANSACTION_CATEGORIES,
  type TransactionFormValues,
} from "@/features/income-expense/schemas/transaction-schema";
import { useLoans } from "@/features/loans/hooks/use-loans";
import { FINANCE_TYPES } from "@/shared/constants/sheets";
import { AmountInput } from "@/shared/components/amount-input";
import { DatePickerField } from "@/shared/components/date-picker-field";

export function IncomeExpenseForm() {
  const addMutation = useAddTransaction();
  const { data: loans = [] } = useLoans();
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date(),
      description: "",
      category: "Income",
      financeType: "Expense",
      loanId: null,
      loanPaymentId: null,
    },
  });

  const category = form.watch("category");
  const selectedLoanId = form.watch("loanId");
  const selectedLoan = useMemo(
    () => loans.find((l) => l.id === selectedLoanId) ?? null,
    [loans, selectedLoanId],
  );

  useEffect(() => {
    if (category !== "Loans") {
      form.setValue("loanId", null, { shouldValidate: true });
      form.setValue("loanPaymentId", null, { shouldValidate: true });
      return;
    }
    // Loans category: default to Expense if user hasn't chosen otherwise.
    if (form.getValues("financeType") !== "Expense") {
      form.setValue("financeType", "Expense", { shouldValidate: true });
    }
  }, [category, form]);

  useEffect(() => {
    if (category !== "Loans") return;
    // Reset month selection if loan changes
    form.setValue("loanPaymentId", null, { shouldValidate: true });
  }, [category, selectedLoanId, form]);

  const onSubmit = (values: TransactionFormValues) => {
    addMutation.mutate(values, {
      onSuccess: () => {
        form.reset({
          date: new Date(),
          description: "",
          category: "Income",
          financeType: "Expense",
          loanId: null,
          loanPaymentId: null,
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 rounded-lg border border-primary/20 bg-secondary/30 p-4 sm:p-5 md:flex-row md:flex-wrap md:items-end"
      >
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="w-full min-w-0 flex-1 md:min-w-[160px]">
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
            <FormItem className="w-full min-w-0 flex-1 md:min-w-[120px]">
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <AmountInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="w-full min-w-0 flex-[2] md:min-w-[180px]">
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
          name="category"
          render={({ field }) => (
            <FormItem className="w-full min-w-0 flex-1 md:min-w-[200px]">
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TRANSACTION_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {category === "Loans" ? (
          <>
            <FormField
              control={form.control}
              name="loanId"
              render={({ field }) => (
                <FormItem className="w-full min-w-0 flex-1 md:min-w-[220px]">
                  <FormLabel>Loan</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v)}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a loan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loans.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
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
              name="loanPaymentId"
              render={({ field }) => (
                <FormItem className="w-full min-w-0 flex-1 md:min-w-[220px]">
                  <FormLabel>Loan month</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value != null ? String(field.value) : ""}
                    disabled={!selectedLoan}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedLoan ? "Select month" : "Select a loan first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(selectedLoan?.payments ?? []).map((p) => (
                        <SelectItem key={p.rowIndex} value={String(p.rowIndex)}>
                          {p.month} {p.status === "paid" ? "(paid)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : null}
        <FormField
          control={form.control}
          name="financeType"
          render={({ field }) => (
            <FormItem className="w-full min-w-0 flex-1 md:min-w-[140px]">
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
        <Button
          type="submit"
          disabled={addMutation.isPending}
          className="w-full md:mb-0.5 md:w-auto"
        >
          {addMutation.isPending ? "Adding…" : "Add"}
        </Button>
      </form>
    </Form>
  );
}
