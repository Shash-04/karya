"use client";

import { useRouter } from "next/navigation";
import { Eye, Trash2 } from "lucide-react";
import type { Task } from "@/lib/types";
import { formatTime } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge, TypeBadge } from "./TypeBadge";
import { ProgressBar } from "./ui/ProgressBar";

export function TaskTable({
  tasks,
  showOwner = false,
  ownerOf,
  onDelete,
}: {
  tasks: Task[];
  showOwner?: boolean;
  ownerOf?: (userId: string) => string;
  onDelete?: (task: Task) => void;
}) {
  const router = useRouter();

  if (tasks.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-medium text-muted">No tasks found.</p>
        <p className="mt-1 text-xs text-faint">Dispatch a task to populate the queue.</p>
      </div>
    );
  }

  const open = (id: string) => router.push(`/tasks/${id}`);

  return (
    <div className="overflow-x-auto tf-scroll">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-faint">
            <th className="px-3 py-2.5">Task Details</th>
            {showOwner && <th className="px-3 py-2.5">Task Owner</th>}
            <th className="px-3 py-2.5">Status</th>
            <th className="w-44 px-3 py-2.5">Progress</th>
            <th className="px-3 py-2.5">Priority</th>
            <th className="px-3 py-2.5">Created</th>
            <th className="px-3 py-2.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              onClick={() => open(task.id)}
              className="cursor-pointer border-b border-border/70 transition-colors hover:bg-brand-softer/60"
            >
              <td className="px-3 py-3">
                <div className="font-semibold text-foreground">{task.name}</div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="font-mono text-[11px] text-faint">
                    ID: {task.id.slice(0, 8)}…
                  </span>
                  <TypeBadge type={task.type} />
                </div>
                {task.errorMessage && (
                  <span className="mt-0.5 block max-w-xs truncate text-xs text-red-500">
                    {task.errorMessage}
                  </span>
                )}
              </td>
              {showOwner && (
                <td className="px-3 py-3">
                  <span className="rounded-md bg-violet-50 px-2 py-0.5 font-mono text-[11px] text-violet-700">
                    {ownerOf ? ownerOf(task.userId) : `${task.userId.slice(0, 8)}…`}
                  </span>
                </td>
              )}
              <td className="px-3 py-3">
                <StatusBadge status={task.status} />
              </td>
              <td className="px-3 py-3">
                <ProgressBar value={task.progress} status={task.status} />
              </td>
              <td className="px-3 py-3">
                <PriorityBadge priority={task.priority} />
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-xs text-muted">
                {formatTime(task.createdAt)}
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      open(task.id);
                    }}
                    className="rounded-md p-1.5 text-faint transition-colors hover:bg-surface-2 hover:text-brand"
                    aria-label="View task"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task);
                      }}
                      className="rounded-md p-1.5 text-faint transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
