import type { TaskStatus } from "@/lib/types";
import { statusMeta } from "@/lib/labels";

export function StatusBadge({ status }: { status: TaskStatus }) {
  const m = statusMeta(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${m.pill}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === "PROCESSING" ? "tf-live-dot" : ""}`}
        style={{ backgroundColor: m.dot }}
      />
      {m.label}
    </span>
  );
}
