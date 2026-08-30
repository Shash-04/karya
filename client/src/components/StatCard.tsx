import { ReactNode } from "react";
import { Card } from "./ui/Card";

export function StatCard({
  label,
  value,
  accent = "text-foreground",
  icon,
  hint,
  iconClass = "bg-brand-soft text-brand",
}: {
  label: string;
  value: number | string;
  accent?: string;
  icon?: ReactNode;
  hint?: ReactNode;
  iconClass?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
        {icon && (
          <span className={`grid h-8 w-8 place-items-center rounded-lg ${iconClass}`}>{icon}</span>
        )}
      </div>
      <p className={`mt-3 text-3xl font-bold tabular-nums ${accent}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
    </Card>
  );
}
