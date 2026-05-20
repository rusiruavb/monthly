import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBudgetTemplates } from "@/features/budget/hooks/use-budget-templates";
import type { AmountMode } from "@/features/budget/types/budget";

const MONTHS = [
  { id: "01", label: "January" },
  { id: "02", label: "February" },
  { id: "03", label: "March" },
  { id: "04", label: "April" },
  { id: "05", label: "May" },
  { id: "06", label: "June" },
  { id: "07", label: "July" },
  { id: "08", label: "August" },
  { id: "09", label: "September" },
  { id: "10", label: "October" },
  { id: "11", label: "November" },
  { id: "12", label: "December" },
] as const;

function splitYearMonth(value: string): { year: string; month: string } {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) {
    const now = new Date();
    return {
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1).padStart(2, "0"),
    };
  }
  return { year: match[1], month: match[2] };
}

interface CreateMonthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultYearMonth: string;
  onConfirm: (yearMonth: string, amountMode: AmountMode) => void;
  isPending?: boolean;
}

export function CreateMonthDialog({
  open,
  onOpenChange,
  defaultYearMonth,
  onConfirm,
  isPending,
}: CreateMonthDialogProps) {
  const { data: templates = [] } = useBudgetTemplates();
  const initial = splitYearMonth(defaultYearMonth);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [amountMode, setAmountMode] = useState<AmountMode>("template");

  const monthlyCount = templates.filter(
    (t) => t.isActive && t.frequency === "monthly",
  ).length;

  const yearMonth = `${year}-${month}`;
  const y = Number(year);
  const yearOptions = Number.isFinite(y)
    ? Array.from({ length: 11 }, (_, i) => String(y - 5 + i))
    : [String(new Date().getFullYear())];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) {
          const nextInitial = splitYearMonth(defaultYearMonth);
          setYear(nextInitial.year);
          setMonth(nextInitial.month);
          setAmountMode("template");
        }
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create month from template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will copy {monthlyCount} active monthly template item
            {monthlyCount === 1 ? "" : "s"} into a new budget sheet.
          </p>
          <div className="space-y-2">
            <Label htmlFor="budget-month">Month</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger id="budget-month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={year} onValueChange={setYear}>
                <SelectTrigger aria-label="Year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((yy) => (
                    <SelectItem key={yy} value={yy}>
                      {yy}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Amounts</Label>
            <Select
              value={amountMode}
              onValueChange={(v) => setAmountMode(v as AmountMode)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="template">Use template amounts</SelectItem>
                <SelectItem value="previous_month">Use previous month amounts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!year || !month || isPending}
            onClick={() => onConfirm(yearMonth, amountMode)}
          >
            {isPending ? "Creating…" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
