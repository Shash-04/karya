import type { TaskStatus } from "@/lib/types";

const styles: Record<TaskStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  PROCESSING: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}
