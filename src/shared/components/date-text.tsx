import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/shared/lib/utils";

interface DateTextProps {
  value: string | Date;
  formatStr?: string;
  className?: string;
}

export function DateText({ value, formatStr = "dd MMM yyyy", className }: DateTextProps) {
  const date = typeof value === "string" ? parseISO(value) : value;
  const display = isValid(date) ? format(date, formatStr) : String(value);
  return <span className={cn("font-mono-numeric", className)}>{display}</span>;
}
