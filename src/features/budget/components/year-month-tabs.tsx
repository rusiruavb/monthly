import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/shared/lib/utils";

const MONTHS = [
  { id: "01", label: "Jan" },
  { id: "02", label: "Feb" },
  { id: "03", label: "Mar" },
  { id: "04", label: "Apr" },
  { id: "05", label: "May" },
  { id: "06", label: "Jun" },
  { id: "07", label: "Jul" },
  { id: "08", label: "Aug" },
  { id: "09", label: "Sep" },
  { id: "10", label: "Oct" },
  { id: "11", label: "Nov" },
  { id: "12", label: "Dec" },
] as const;

function splitYearMonth(yearMonth: string): { year: string; month: string } {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  if (!match) return { year: String(new Date().getFullYear()), month: "01" };
  return { year: match[1], month: match[2] };
}

function addMonths(yearMonth: string, delta: number): string {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  if (!match) return yearMonth;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const date = new Date(y, m - 1 + delta, 1);
  const yy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

export function YearMonthTabs({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  className?: string;
}) {
  const { year, month } = splitYearMonth(value);
  const windowMonths = [addMonths(value, -2), addMonths(value, -1), value].map((ym) => {
    const { month: mm } = splitYearMonth(ym);
    const label = MONTHS.find((x) => x.id === mm)?.label ?? mm;
    return { ym, mm, label };
  });

  const setYear = (nextYear: string) => {
    const y = /^\d{4}$/.test(nextYear) ? nextYear : year;
    onChange(`${y}-${month}`);
  };

  const y = Number(year);
  const yearOptions = Number.isFinite(y)
    ? Array.from({ length: 11 }, (_, i) => String(y - 5 + i))
    : [String(new Date().getFullYear())];

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Select value={year} onValueChange={setYear}>
        <SelectTrigger className="h-9 w-28 border-primary/20">
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

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-9 w-9 border-primary/20"
          onClick={() => onChange(addMonths(value, -1))}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {windowMonths.map((m) => (
          <Button
            key={m.ym}
            type="button"
            variant={m.ym === value ? "default" : "outline"}
            className={cn("h-9 border-primary/20", m.ym !== value && "text-primary")}
            onClick={() => onChange(m.ym)}
          >
            {m.label}
          </Button>
        ))}

        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-9 w-9 border-primary/20"
          onClick={() => onChange(addMonths(value, 1))}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

