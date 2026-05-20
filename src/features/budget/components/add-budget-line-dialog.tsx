import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  budgetLineSchema,
  type BudgetLineFormValues,
} from "@/features/budget/schemas/budget-schema";
import { SECTION_LABELS, SECTION_ORDER } from "@/features/budget/lib/section-labels";
import type { BudgetSection } from "@/features/budget/types/budget";
import { AmountInput } from "@/shared/components/amount-input";
import { DatePickerField } from "@/shared/components/date-picker-field";
import { FINANCE_TYPES } from "@/shared/constants/sheets";

const FEATURE_CATEGORIES = [
  "Grocery",
  "Online payment",
  "Travel",
  "Petrol",
  "Dining",
  "Subscriptions",
  "Utilities",
  "Rent",
  "Medical",
  "Entertainment",
] as const;

interface AddBudgetLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSection: BudgetSection;
  onSubmit: (values: BudgetLineFormValues) => void;
  isPending?: boolean;
}

export function AddBudgetLineDialog({
  open,
  onOpenChange,
  defaultSection,
  onSubmit,
  isPending,
}: AddBudgetLineDialogProps) {
  const form = useForm<BudgetLineFormValues>({
    resolver: zodResolver(budgetLineSchema),
    defaultValues: {
      description: "",
      amount: undefined,
      financeType: defaultSection === "income" ? "Income" : "Expense",
      section: defaultSection,
      plannedDate: null,
      postToLedger: false,
      itemType: "regular",
      savingsBucket: "savings",
      featureCategory: null,
      fixedDepositDate: null,
      fixedDepositMaturityMonths: null,
      fixedDepositInterestRate: null,
    },
  });

  const selectedSection = form.watch("section");
  const itemType = form.watch("itemType") ?? "regular";
  const isFixedDeposit = selectedSection === "savings" && itemType === "fixed_deposit";
  const featureCategory = form.watch("featureCategory") ?? null;
  const [featureCategoryMode, setFeatureCategoryMode] = useState<
    "none" | "preset" | "custom"
  >("none");

  useEffect(() => {
    if (featureCategory == null) {
      setFeatureCategoryMode("none");
      return;
    }
    setFeatureCategoryMode(
      FEATURE_CATEGORIES.includes(featureCategory as never) ? "preset" : "custom",
    );
  }, [featureCategory]);

  useEffect(() => {
    if (open) {
      form.reset({
        description: "",
        amount: undefined,
        financeType: defaultSection === "income" ? "Income" : "Expense",
        section: defaultSection,
        plannedDate: null,
        postToLedger: false,
        itemType: "regular",
        savingsBucket: "savings",
        featureCategory: null,
        fixedDepositDate: null,
        fixedDepositMaturityMonths: null,
        fixedDepositInterestRate: null,
      });
      setFeatureCategoryMode("none");
    }
  }, [open, defaultSection, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add line to month</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => onSubmit(values))}
            className="space-y-4"
          >
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
              name="amount"
              render={({ field }) => (
                <FormItem>
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
              name="plannedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <DatePickerField
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : null)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postToLedger"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2 rounded-md border border-primary/15 bg-secondary/10 px-3 py-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 accent-primary"
                      />
                    </FormControl>
                    <div className="min-w-0">
                      <FormLabel className="cursor-pointer">Post to ledger</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        If enabled, this line will be posted to your ledger immediately after saving.
                      </p>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedSection === "savings" && (
              <FormField
                control={form.control}
                name="itemType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saving type</FormLabel>
                    <Select
                      onValueChange={(v) => {
                        field.onChange(v);
                        if (v !== "fixed_deposit") {
                          form.setValue("fixedDepositDate", null);
                          form.setValue("fixedDepositMaturityMonths", null);
                          form.setValue("fixedDepositInterestRate", null);
                        }
                      }}
                      value={field.value ?? "regular"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="regular">Regular saving</SelectItem>
                        <SelectItem value="fixed_deposit">Fixed deposit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isFixedDeposit && (
              <div className="space-y-4 rounded-lg border border-primary/15 bg-secondary/20 p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fixedDepositDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deposit date</FormLabel>
                        <FormControl>
                          <DatePickerField
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date) =>
                              field.onChange(date ? format(date, "yyyy-MM-dd") : null)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fixedDepositInterestRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interest %</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            max={100}
                            step="0.01"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? null : Number(e.target.value),
                              )
                            }
                            placeholder="8.50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="fixedDepositMaturityMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maturity</FormLabel>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Select
                          onValueChange={(v) => {
                            if (v === "custom") return;
                            field.onChange(Number(v));
                          }}
                          value={
                            field.value == null
                              ? ""
                              : [3, 6, 9, 12, 24, 36].includes(field.value)
                                ? String(field.value)
                                : "custom"
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 months</SelectItem>
                            <SelectItem value="6">6 months</SelectItem>
                            <SelectItem value="9">9 months</SelectItem>
                            <SelectItem value="12">1 year</SelectItem>
                            <SelectItem value="24">2 years</SelectItem>
                            <SelectItem value="36">3 years</SelectItem>
                            <SelectItem value="custom">Custom…</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="space-y-1">
                          <Label htmlFor="fd-custom-months-month">Custom months</Label>
                          <Input
                            id="fd-custom-months-month"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? null : Number(e.target.value),
                              )
                            }
                            placeholder="18"
                          />
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SECTION_ORDER.map((s) => (
                        <SelectItem key={s} value={s}>
                          {SECTION_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedSection === "savings" && itemType !== "fixed_deposit" ? (
              <FormField
                control={form.control}
                name="savingsBucket"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Savings bucket</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? "savings"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="one_off">One-off</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="featureCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feature category</FormLabel>
                  <div className="grid items-end gap-2 sm:grid-cols-2">
                    <Select
                      onValueChange={(v) => {
                        if (v === "custom") {
                          setFeatureCategoryMode("custom");
                          if (field.value == null || FEATURE_CATEGORIES.includes(field.value as never)) {
                            field.onChange("");
                          }
                          return;
                        }
                        setFeatureCategoryMode("preset");
                        field.onChange(v);
                      }}
                      value={
                        featureCategoryMode === "preset" && field.value
                          ? field.value
                          : featureCategoryMode === "custom"
                            ? "custom"
                            : ""
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FEATURE_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom…</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="space-y-1">
                      <Label htmlFor="feature-category-custom">
                        Custom category
                      </Label>
                      <Input
                        id="feature-category-custom"
                        value={featureCategoryMode === "custom" ? String(field.value ?? "") : ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.trim() === "" ? null : e.target.value,
                          )
                        }
                        placeholder="e.g. Education"
                        disabled={featureCategoryMode !== "custom"}
                      />
                    </div>
                  </div>
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
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adding…" : "Add"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
