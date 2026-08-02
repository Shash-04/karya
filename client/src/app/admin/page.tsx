"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Spinner } from "@/components/ui/Spinner";
import { useAdminUsers, useAllTasks, useQueueMetrics } from "@/hooks/useAdmin";
import { formatDateTime } from "@/lib/format";

export default function AdminPage() {
  return (
    <AuthGuard requireAdmin>
      <AppShell>
        <AdminContent />
      </AppShell>
    </AuthGuard>
  );
}

function AdminContent() {
  const metrics = useQueueMetrics();
  const [taskPage, setTaskPage] = useState(0);
  const tasks = useAllTasks({ page: taskPage, size: 10, sortBy: "createdAt", order: "desc" });
  const users = useAdminUsers(0);

  const m = metrics.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin</h1>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Queue metrics
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <StatCard label="Ready" value={m?.readyDepth ?? 0} accent="text-indigo-500" />
          <StatCard label="Delayed" value={m?.delayedDepth ?? 0} accent="text-amber-500" />
          <StatCard label="Pending" value={m?.pending ?? 0} />
          <StatCard label="Processing" value={m?.processing ?? 0} accent="text-blue-500" />
          <StatCard label="Completed" value={m?.completed ?? 0} accent="text-green-500" />
          <StatCard label="Failed" value={m?.failed ?? 0} accent="text-red-500" />
          <StatCard label="Total" value={m?.totalTasks ?? 0} />
        </div>
      </section>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Users</h2>
        {users.isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800">
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Role</th>
                  <th className="px-3 py-2 font-medium">Tasks</th>
                  <th className="px-3 py-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.data?.content.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/60">
                    <td className="px-3 py-2.5 font-medium">{u.name}</td>
                    <td className="px-3 py-2.5 text-slate-500">{u.email}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.role === "ADMIN"
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-slate-500">{u.totalTasks}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-500">
                      {formatDateTime(u.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          All tasks
        </h2>
        {tasks.isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800">
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Owner</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium w-48">Progress</th>
                </tr>
              </thead>
              <tbody>
                {tasks.data?.content.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800/60">
                    <td className="px-3 py-2.5 font-medium">{t.name}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-400">
                      {t.userId.slice(0, 8)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500">{t.type}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-3 py-2.5">
                      <ProgressBar value={t.progress} status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tasks.data && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>
              Page {tasks.data.page + 1} of {tasks.data.totalPages} · {tasks.data.totalElements} tasks
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={tasks.data.page === 0}
                onClick={() => setTaskPage((p) => Math.max(0, p - 1))}
              >
                Prev
              </Button>
              <Button
                variant="secondary"
                disabled={tasks.data.last}
                onClick={() => setTaskPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
