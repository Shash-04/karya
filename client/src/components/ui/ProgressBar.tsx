import type { TaskStatus } from "@/lib/types";

const barColor: Record<TaskStatus, string> = {
  PENDING: "bg-stone-300",
  PROCESSING: "bg-blue-500",
  COMPLETED: "bg-emerald-500",
  FAILED: "bg-red-500",
};

export function ProgressBar({ value, status }: { value: number; status: TaskStatus }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
        <div
          className={`h-full rounded-full transition-all ${barColor[status]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-9 text-right text-xs font-medium tabular-nums text-muted">{pct}%</span>
    </div>
  );
}
