"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  CheckCircle2,
  ListChecks,
  Loader,
  Plus,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader, LiveKicker } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { TaskFormModal } from "@/components/TaskFormModal";
import { TaskQueuePanel } from "@/components/TaskQueuePanel";
import { Button } from "@/components/ui/Button";
import { useQueueMetrics } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useTaskStats } from "@/hooks/useTasks";

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
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);

  const userStats = useTaskStats();
  const metrics = useQueueMetrics(isAdmin);

  // Admins see platform-wide counts (all users); regular users see their own.
  const s = isAdmin
    ? metrics.data && {
        total: metrics.data.totalTasks,
        pending: metrics.data.pending,
        processing: metrics.data.processing,
        completed: metrics.data.completed,
        failed: metrics.data.failed,
        queued: metrics.data.readyDepth + metrics.data.delayedDepth,
      }
    : userStats.data;

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
    queryClient.invalidateQueries({ queryKey: ["task-stats"] });
  }

  return (
    <div>
      <PageHeader
        kicker={<LiveKicker label="Async Queue Engine" />}
        title="Task Automation Dashboard"
        subtitle="Live queue execution metrics, worker concurrency, and automated task logs."
        actions={
          <>
            <Button variant="secondary" onClick={refresh}>
              <RefreshCw className="h-4 w-4" /> Refresh Queue
            </Button>
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> Create Task
            </Button>
          </>
        }
      />

      <TaskFormModal open={creating} onClose={() => setCreating(false)} mode="create" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Tasks"
          value={s?.total ?? 0}
          icon={<ListChecks className="h-4 w-4" />}
          hint="Live"
        />
        <StatCard
          label="Processing / Pending"
          value={(s?.processing ?? 0) + (s?.pending ?? 0)}
          icon={<Loader className="h-4 w-4" />}
          iconClass="bg-blue-50 text-blue-600"
          hint={`${s?.processing ?? 0} active, ${s?.queued ?? 0} queued`}
        />
        <StatCard
          label="Completed"
          value={s?.completed ?? 0}
          accent="text-emerald-600"
          icon={<CheckCircle2 className="h-4 w-4" />}
          iconClass="bg-emerald-50 text-emerald-600"
          hint="Finished successfully"
        />
        <StatCard
          label="Failed Jobs"
          value={s?.failed ?? 0}
          accent="text-red-600"
          icon={<XCircle className="h-4 w-4" />}
          iconClass="bg-red-50 text-red-600"
          hint="Max retries exceeded"
        />
      </div>

      {isAdmin && <AdminBanner />}

      <div className="mt-6">
        <TaskQueuePanel admin={isAdmin} />
      </div>
    </div>
  );
}

function AdminBanner() {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl2 border border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-5 py-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-600">
        <ShieldCheck className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-bold text-violet-900">GLOBAL ADMIN OVERSIGHT ACTIVE</p>
        <p className="text-xs text-violet-700">
          You have global administrative visibility. Viewing, managing, and retrying tasks across
          all platform users.
        </p>
      </div>
      <span className="hidden rounded-full border border-violet-300 bg-white/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700 sm:inline">
        System-wide access
      </span>
    </div>
  );
}
