"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useAdminUsers, useAllTasks } from "@/hooks/useAdmin";
import { useDeleteTask, useTasks } from "@/hooks/useTasks";
import { TASK_TYPES, taskTypeMeta } from "@/lib/labels";
import type { TaskStatus, TaskType } from "@/lib/types";
import { TaskTable } from "./TaskTable";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";

const STATUS_TABS: { value: TaskStatus | ""; label: string }[] = [
  { value: "", label: "All Tasks" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
];

export function TaskQueuePanel({ admin = false }: { admin?: boolean }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [type, setType] = useState<TaskType | "">("");
  const [page, setPage] = useState(0);

  const debouncedSearch = useDebounce(search);
  const params = {
    search: debouncedSearch || undefined,
    status: status || undefined,
    type: type || undefined,
    sortBy: "createdAt",
    order: "desc" as const,
    page,
    size: 10,
  };

  const mineQ = useTasks(params, !admin);
  const allQ = useAllTasks(params, admin);
  const query = admin ? allQ : mineQ;

  const usersQ = useAdminUsers(0, admin);
  const ownerOf = useMemo(() => {
    const map = new Map((usersQ.data?.content ?? []).map((u) => [u.id, u.email]));
    return (id: string) => map.get(id) ?? `${id.slice(0, 8)}…`;
  }, [usersQ.data]);

  const del = useDeleteTask();
  const pageData = query.data;

  function reset<T>(setter: (v: T) => void, v: T) {
    setter(v);
    setPage(0);
  }

  async function onDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await del.mutateAsync(id);
  }

  return (
    <div className="rounded-xl2 border border-border bg-surface shadow-sm shadow-stone-900/[0.03]">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-surface-2 p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => reset(setStatus, tab.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                status === tab.value
                  ? "bg-brand text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              placeholder="Search title, ID…"
              value={search}
              onChange={(e) => reset(setSearch, e.target.value)}
              className="w-52 rounded-lg border border-border-strong bg-surface py-2 pl-8 pr-3 text-sm outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/25"
            />
          </div>
          <div className="relative">
            <select
              value={type}
              onChange={(e) => reset(setType, e.target.value as TaskType | "")}
              className="appearance-none rounded-lg border border-border-strong bg-surface py-2 pl-3 pr-8 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
            >
              <option value="">All Types</option>
              {TASK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {taskTypeMeta(t).label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          </div>
          {query.isFetching && <Spinner className="h-4 w-4" />}
        </div>
      </div>

      {/* Table */}
      <div className="px-2">
        {query.isError ? (
          <p className="py-16 text-center text-sm text-red-500">Failed to load tasks.</p>
        ) : query.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
            <Spinner className="h-5 w-5" /> Fetching task queue…
          </div>
        ) : (
          <TaskTable
            tasks={pageData?.content ?? []}
            showOwner={admin}
            ownerOf={ownerOf}
            onDelete={(t) => onDelete(t.id, t.name)}
          />
        )}
      </div>

      {/* Pagination */}
      {pageData && pageData.totalElements > 0 && (
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted">
          <span>
            Showing page {pageData.page + 1} of {pageData.totalPages} ({pageData.totalElements} total
            items)
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="px-3 py-1.5"
              disabled={pageData.page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              className="px-3 py-1.5"
              disabled={pageData.last}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
