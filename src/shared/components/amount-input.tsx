import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn, formatAmountDisplay, parseAmount } from "@/shared/lib/utils";

type AmountInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "value" | "onChange" | "type" | "defaultValue"
> & {
  value?: number;
  onChange: (value: number | undefined) => void;
};

export function AmountInput({ value, onChange, className, ...props }: AmountInputProps) {
  const [display, setDisplay] = useState(() =>
    value != null && value > 0 ? formatAmountDisplay(String(value)) : "",
  );

  useEffect(() => {
    if (value == null || value === 0) {
      setDisplay("");
    } else {
      setDisplay(formatAmountDisplay(String(value)));
    }
  }, [value]);

  return (
    <Input
      type="text"
      inputMode="decimal"
      placeholder="0"
      autoComplete="off"
      className={cn("font-mono-numeric", className)}
      value={display}
      onChange={(e) => {
        const formatted = formatAmountDisplay(e.target.value);
        setDisplay(formatted);
        onChange(formatted === "" ? undefined : parseAmount(formatted));
      }}
      {...props}
    />
  );
}
