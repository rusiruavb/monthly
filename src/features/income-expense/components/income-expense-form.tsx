import { zodResolver } from "@hookform/resolvers/zod";
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
  type TransactionFormValues,
} from "@/features/income-expense/schemas/transaction-schema";
import { FINANCE_TYPES } from "@/shared/constants/sheets";
import { DatePickerField } from "@/shared/components/date-picker-field";
import { FileUpload } from "@/shared/components/file-upload";

export function IncomeExpenseForm() {
  const addMutation = useAddTransaction();
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date(),
      amount: 0,
      description: "",
      financeType: "Expense",
      file: null,
    },
  });

  const onSubmit = (values: TransactionFormValues) => {
    addMutation.mutate(values, {
      onSuccess: () => {
        form.reset({
          date: new Date(),
          amount: 0,
          description: "",
          financeType: "Expense",
          file: null,
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
                <Input
                  type="number"
                  step="0.01"
                  className="font-mono-numeric"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
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
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>File</FormLabel>
              <FormControl>
                <FileUpload
                  selectedFile={field.value}
                  onFileSelect={field.onChange}
                />
              </FormControl>
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
