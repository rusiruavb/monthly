import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useCreateLoan } from "@/features/loans/hooks/use-create-loan";
import { useUpdateLoan } from "@/features/loans/hooks/use-update-loan";
import {
  loanSchema,
  type LoanFormValues,
} from "@/features/loans/schemas/loan-schema";
import type { Loan } from "@/features/loans/types/loan";
import { LOAN_TYPES } from "@/shared/constants/sheets";

interface LoanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan?: Loan;
}

export function LoanFormDialog({ open, onOpenChange, loan }: LoanFormDialogProps) {
  const createMutation = useCreateLoan();
  const updateMutation = useUpdateLoan();
  const isEdit = !!loan;

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: loan
      ? {
          name: loan.name,
          type: loan.type,
          months: loan.months,
          monthlyPayment: loan.monthlyPayment,
        }
      : {
          name: "",
          type: "bank",
          months: 12,
          monthlyPayment: 0,
        },
  });

  const onSubmit = (values: LoanFormValues) => {
    if (isEdit && loan) {
      updateMutation.mutate(
        { loanId: loan.id, values },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit loan" : "Create loan"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LOAN_TYPES.map((t) => (
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
              name="months"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of months</FormLabel>
                  <FormControl>
                    <Input type="number" className="font-mono-numeric" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monthlyPayment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly payment</FormLabel>
                  <FormControl>
                    <Input type="number" className="font-mono-numeric" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {isEdit ? "Save changes" : "Create loan"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
