import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function parseAmount(value: string): number {
  const parsed = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
}

/** Formats a raw amount string with thousand separators while typing. */
export function formatAmountDisplay(raw: string): string {
  const cleaned = raw.replace(/,/g, "");
  if (cleaned === "") return "";

  const endsWithDot = cleaned.endsWith(".");
  const [intPart, ...rest] = cleaned.split(".");
  const intDigits = intPart.replace(/\D/g, "");
  const decDigits = rest.join("").replace(/\D/g, "").slice(0, 2);

  const formattedInt =
    intDigits === ""
      ? endsWithDot || rest.length > 0
        ? "0"
        : ""
      : intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (rest.length > 0 || endsWithDot) {
    if (decDigits) return `${formattedInt}.${decDigits}`;
    if (endsWithDot) return `${formattedInt}.`;
    return formattedInt;
  }

  return formattedInt;
}
