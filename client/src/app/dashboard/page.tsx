"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { StatCard } from "@/components/StatCard";
import { TaskFormModal } from "@/components/TaskFormModal";
import { TaskTable } from "@/components/TaskTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useDebounce } from "@/hooks/useDebounce";
import { useTaskStats, useTasks } from "@/hooks/useTasks";
import type { TaskStatus, TaskType } from "@/lib/types";

const STATUSES: TaskStatus[] = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"];
const TYPES: TaskType[] = [
  "EMAIL",
  "REPORT",
  "DATA_EXPORT",
  "IMAGE_PROCESSING",
  "WEBHOOK",
  "GENERIC",
];
const selectClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <AppShell>
        <DashboardContent />
      </AppShell>
    </AuthGuard>
  );
}

function DashboardContent() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [type, setType] = useState<TaskType | "">("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);

  const debouncedSearch = useDebounce(search);

  const stats = useTaskStats();
  const tasks = useTasks({
    search: debouncedSearch || undefined,
    status: status || undefined,
    type: type || undefined,
    sortBy,
    order,
    page,
    size: 10,
  });

  const s = stats.data;
  const pageData = tasks.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => setCreating(true)}>+ New task</Button>
      </div>
      <TaskFormModal open={creating} onClose={() => setCreating(false)} mode="create" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total" value={s?.total ?? 0} />
        <StatCard label="Pending" value={s?.pending ?? 0} accent="text-slate-500" />
        <StatCard label="Processing" value={s?.processing ?? 0} accent="text-blue-500" />
        <StatCard label="Completed" value={s?.completed ?? 0} accent="text-green-500" />
        <StatCard label="Failed" value={s?.failed ?? 0} accent="text-red-500" />
        <StatCard label="Queued" value={s?.queued ?? 0} accent="text-indigo-500" />
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="max-w-xs"
          />
          <select
            className={selectClass}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as TaskStatus | "");
              setPage(0);
            }}
          >
            <option value="">All statuses</option>
            {STATUSES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={type}
            onChange={(e) => {
              setType(e.target.value as TaskType | "");
              setPage(0);
            }}
          >
            <option value="">All types</option>
            {TYPES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <select className={selectClass} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">Created</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="name">Name</option>
          </select>
          <Button
            variant="secondary"
            onClick={() => setOrder((o) => (o === "asc" ? "desc" : "asc"))}
          >
            {order === "asc" ? "Asc ↑" : "Desc ↓"}
          </Button>
          {tasks.isFetching && <Spinner className="h-4 w-4" />}
        </div>

        <div className="mt-4">
          {tasks.isError ? (
            <p className="py-16 text-center text-sm text-red-500">Failed to load tasks.</p>
          ) : tasks.isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
            <TaskTable tasks={pageData?.content ?? []} />
          )}
        </div>

        {pageData && pageData.totalElements > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>
              Page {pageData.page + 1} of {pageData.totalPages} · {pageData.totalElements} tasks
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={pageData.page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Prev
              </Button>
              <Button variant="secondary" disabled={pageData.last} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
