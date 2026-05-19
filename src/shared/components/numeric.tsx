import type { ReactNode } from "react";
import { cn, formatCurrency } from "@/shared/lib/utils";

interface NumericProps {
  value: number;
  className?: string;
  currency?: boolean;
  children?: ReactNode;
}

export function Numeric({ value, className, currency = true, children }: NumericProps) {
  const display = children ?? (currency ? formatCurrency(value) : value.toLocaleString());
  return <span className={cn("font-mono-numeric", className)}>{display}</span>;
}
