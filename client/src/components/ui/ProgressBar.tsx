import type { TaskStatus } from "@/lib/types";

const barColor: Record<TaskStatus, string> = {
  PENDING: "bg-slate-400",
  PROCESSING: "bg-blue-500",
  COMPLETED: "bg-green-500",
  FAILED: "bg-red-500",
};

export function ProgressBar({ value, status }: { value: number; status: TaskStatus }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${barColor[status]}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="w-9 text-right text-xs tabular-nums text-slate-500">{value}%</span>
    </div>
  );
}
