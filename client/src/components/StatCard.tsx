import { Card } from "./ui/Card";

export function StatCard({
  label,
  value,
  accent = "text-slate-900 dark:text-slate-100",
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${accent}`}>{value}</p>
    </Card>
  );
}
