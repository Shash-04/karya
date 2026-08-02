"use client";

import { useRouter } from "next/navigation";
import type { Task } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ui/ProgressBar";

export function TaskTable({ tasks }: { tasks: Task[] }) {
  const router = useRouter();

  if (tasks.length === 0) {
    return <p className="py-16 text-center text-sm text-slate-500">No tasks found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800">
            <th className="px-3 py-2 font-medium">Name</th>
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium w-48">Progress</th>
            <th className="px-3 py-2 font-medium">Priority</th>
            <th className="px-3 py-2 font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              onClick={() => router.push(`/tasks/${task.id}`)}
              className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
            >
              <td className="px-3 py-2.5 font-medium">
                {task.name}
                {task.errorMessage && (
                  <span className="block max-w-xs truncate text-xs text-red-500">
                    {task.errorMessage}
                  </span>
                )}
              </td>
              <td className="px-3 py-2.5 text-slate-500">{task.type}</td>
              <td className="px-3 py-2.5">
                <StatusBadge status={task.status} />
              </td>
              <td className="px-3 py-2.5">
                <ProgressBar value={task.progress} status={task.status} />
              </td>
              <td className="px-3 py-2.5 tabular-nums text-slate-500">{task.priority}</td>
              <td className="px-3 py-2.5 whitespace-nowrap text-slate-500">
                {formatDateTime(task.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
