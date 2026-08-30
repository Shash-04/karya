import type { TaskType } from "@/lib/types";
import { priorityMeta, taskTypeMeta } from "@/lib/labels";

/** Mono type token with a colored dot, e.g. "• FILE_PROCESSING". */
export function TypeBadge({ type }: { type: TaskType }) {
  const m = taskTypeMeta(type);
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-medium ${m.color}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.dot }} />
      {m.label}
    </span>
  );
}

/** P1–P4 priority chip. */
export function PriorityBadge({ priority }: { priority: number }) {
  const m = priorityMeta(priority);
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-bold ring-1 ring-inset ${m.pill}`}
    >
      {m.label}
    </span>
  );
}
