import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyDataPoint } from "@/features/summary/types/summary";
import { formatCurrency } from "@/shared/lib/utils";

interface LoanPaymentsChartProps {
  data: MonthlyDataPoint[];
}

export function LoanPaymentsChart({ data }: LoanPaymentsChartProps) {
  return (
    <div className="h-[220px] w-full sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#10463B20" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Bar dataKey="loanPayments" name="Loan payments" fill="#10463B" radius={[4, 4, 0, 0]} />
      </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
