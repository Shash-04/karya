// Frontend-only presentation helpers. Type labels mirror the backend
// TaskType enum verbatim so the UI names match what the worker actually
// runs; this layer only adds visual tokens — colored type/status pills
// and P1–P4 priority badges — without changing any API contract.

import type { TaskStatus, TaskType } from "./types";

export interface Meta {
  label: string;
  /** tailwind text color class */
  color: string;
  /** tailwind bg tint + text class for pills */
  pill: string;
  /** hex dot color */
  dot: string;
}

const TYPE_META: Record<TaskType, Meta> = {
  IMAGE_PROCESSING: {
    label: "IMAGE_PROCESSING",
    color: "text-sky-600",
    pill: "bg-sky-50 text-sky-700",
    dot: "#0284c7",
  },
  DATA_EXPORT: {
    label: "DATA_EXPORT",
    color: "text-violet-600",
    pill: "bg-violet-50 text-violet-700",
    dot: "#7c3aed",
  },
  REPORT: {
    label: "REPORT",
    color: "text-amber-600",
    pill: "bg-amber-50 text-amber-700",
    dot: "#d97706",
  },
  WEBHOOK: {
    label: "WEBHOOK",
    color: "text-emerald-600",
    pill: "bg-emerald-50 text-emerald-700",
    dot: "#059669",
  },
  EMAIL: {
    label: "EMAIL",
    color: "text-rose-600",
    pill: "bg-rose-50 text-rose-700",
    dot: "#e11d48",
  },
  GENERIC: {
    label: "GENERIC",
    color: "text-stone-600",
    pill: "bg-stone-100 text-stone-700",
    dot: "#78716c",
  },
};

export function taskTypeMeta(type: TaskType): Meta {
  return TYPE_META[type] ?? TYPE_META.GENERIC;
}

/** All selectable types, in the order shown in the reference "All Types" filter. */
export const TASK_TYPES: TaskType[] = [
  "IMAGE_PROCESSING",
  "DATA_EXPORT",
  "REPORT",
  "WEBHOOK",
  "EMAIL",
  "GENERIC",
];

const STATUS_META: Record<TaskStatus, Meta> = {
  PENDING: {
    label: "PENDING",
    color: "text-amber-600",
    pill: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "#d97706",
  },
  PROCESSING: {
    label: "PROCESSING",
    color: "text-blue-600",
    pill: "bg-blue-50 text-blue-700 ring-blue-600/20",
    dot: "#2563eb",
  },
  COMPLETED: {
    label: "COMPLETED",
    color: "text-emerald-600",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "#16a34a",
  },
  FAILED: {
    label: "FAILED",
    color: "text-red-600",
    pill: "bg-red-50 text-red-700 ring-red-600/20",
    dot: "#dc2626",
  },
};

export function statusMeta(status: TaskStatus): Meta {
  return STATUS_META[status] ?? STATUS_META.PENDING;
}

export const TASK_STATUSES: TaskStatus[] = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"];

/** Map the backend's integer priority onto a P1–P4 badge. Higher = more urgent. */
export function priorityMeta(priority: number): { label: string; pill: string } {
  const p = priority <= 0 ? 1 : Math.min(priority, 4);
  const pills: Record<number, string> = {
    1: "bg-stone-100 text-stone-600 ring-stone-500/20",
    2: "bg-sky-50 text-sky-700 ring-sky-600/20",
    3: "bg-amber-50 text-amber-700 ring-amber-600/20",
    4: "bg-red-50 text-red-700 ring-red-600/20",
  };
  return { label: `P${p}`, pill: pills[p] };
}
