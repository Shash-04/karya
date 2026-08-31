"use client";

import {
  Activity,
  CheckCircle2,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  Layers,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader, LiveKicker } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { useSystemTelemetry } from "@/hooks/useSystem";
import type { SystemTelemetry } from "@/lib/types";

export default function TelemetryPage() {
  return (
    <AuthGuard>
      <AppShell>
        <TelemetryContent />
      </AppShell>
    </AuthGuard>
  );
}

function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(1)} ${units[i]}`;
}

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function TelemetryContent() {
  const { data, isLoading } = useSystemTelemetry();

  return (
    <div>
      <PageHeader
        kicker={<LiveKicker label="Live Telemetry Stream" />}
        title="Queue &amp; Runtime Telemetry"
        subtitle="Worker-pool concurrency, queue depth, and live Redis / JVM engine metrics."
        actions={
          <span className="rounded-lg border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-muted">
            Redis:{" "}
            <span className="font-mono text-foreground">
              {data?.redis.available ? `v${data.redis.version ?? "?"}` : "offline"}
            </span>
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Job Success Rate"
          value={data ? `${successRate(data)}%` : loadingText(isLoading)}
          hint={data ? `${data.tasks.completed} completed / ${data.tasks.failed} failed` : " "}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="text-emerald-600"
        />
        <Metric
          label="Queue Depth"
          value={data ? String(data.queue.readyDepth + data.queue.delayedDepth) : loadingText(isLoading)}
          hint={data ? `${data.queue.readyDepth} ready / ${data.queue.delayedDepth} delayed` : " "}
          icon={<Layers className="h-4 w-4" />}
        />
        <Metric
          label="Worker Concurrency"
          value={data ? `${data.workerPool.activeCount} / ${data.workerPool.maxPoolSize}` : loadingText(isLoading)}
          hint={data ? `${data.workerPool.poolSize} threads in pool` : " "}
          icon={<Cpu className="h-4 w-4" />}
          tone="text-brand"
        />
        <Metric
          label="Redis Ops / sec"
          value={data ? (data.redis.opsPerSec != null ? String(data.redis.opsPerSec) : "—") : loadingText(isLoading)}
          hint="Instantaneous throughput"
          icon={<Gauge className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <Activity className="h-4 w-4 text-brand" /> Worker Pool
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted">
              {data ? `${data.workerPool.completedTasks.toLocaleString()} completed` : ""}
            </span>
          </div>
          {data ? (
            <>
              <div className="mb-4">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted">Active utilization</span>
                  <span className="font-semibold text-foreground">
                    {data.workerPool.activeCount} / {data.workerPool.maxPoolSize} threads
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-brand transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (data.workerPool.activeCount / Math.max(1, data.workerPool.maxPoolSize)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MiniStat label="Core Pool" value={String(data.workerPool.corePoolSize)} />
                <MiniStat label="Max Pool" value={String(data.workerPool.maxPoolSize)} />
                <MiniStat label="Queued Tasks" value={String(data.workerPool.queuedTasks)} />
                <MiniStat label="Queue Capacity" value={String(data.workerPool.queueCapacity)} />
              </div>
            </>
          ) : (
            <Skeleton />
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <Database className="h-4 w-4 text-brand" /> Redis Engine
            </h2>
            <span
              className={`text-[10px] font-bold uppercase tracking-wide ${
                data?.redis.available ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {data ? (data.redis.available ? `v${data.redis.version ?? "?"}` : "Offline") : ""}
            </span>
          </div>
          {data ? (
            data.redis.available ? (
              <div className="grid grid-cols-2 gap-3">
                <MiniStat label="Used Memory" value={data.redis.usedMemoryHuman ?? formatBytes(data.redis.usedMemoryBytes)} />
                <MiniStat label="Connected Clients" value={String(data.redis.connectedClients ?? "—")} />
                <MiniStat
                  label="Eviction Policy"
                  value={data.redis.maxMemoryPolicy ?? "—"}
                  mono
                />
                <MiniStat
                  label="AOF Persistence"
                  value={data.redis.aofEnabled == null ? "—" : data.redis.aofEnabled ? "ON" : "OFF"}
                  tone={data.redis.aofEnabled ? "text-emerald-600" : "text-foreground"}
                />
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-muted">Redis is not reachable.</p>
            )
          ) : (
            <Skeleton />
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <HardDrive className="h-4 w-4 text-brand" /> JVM Runtime
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted">
              {data ? `up ${formatUptime(data.jvm.uptimeMs)}` : ""}
            </span>
          </div>
          {data ? (
            <>
              <div className="mb-4">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted">Heap used</span>
                  <span className="font-semibold text-foreground">
                    {formatBytes(data.jvm.heapUsedBytes)} / {formatBytes(data.jvm.heapMaxBytes)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (data.jvm.heapUsedBytes / Math.max(1, data.jvm.heapMaxBytes)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MiniStat label="Process CPU" value={`${data.jvm.cpuUsagePercent}%`} />
                <MiniStat label="Processors" value={String(data.jvm.availableProcessors)} />
              </div>
            </>
          ) : (
            <Skeleton />
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <Database className="h-4 w-4 text-brand" /> Database Pool
            </h2>
            <span
              className={`text-[10px] font-bold uppercase tracking-wide ${
                data?.database.available ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {data ? (data.database.available ? "Connected" : "Offline") : ""}
            </span>
          </div>
          {data ? (
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Active" value={String(data.database.activeConnections ?? "—")} />
              <MiniStat label="Idle" value={String(data.database.idleConnections ?? "—")} />
              <MiniStat label="Total" value={String(data.database.totalConnections ?? "—")} />
              <MiniStat label="Max Pool" value={String(data.database.maxPoolSize ?? "—")} />
            </div>
          ) : (
            <Skeleton />
          )}
        </Card>
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-faint">
        <Zap className="h-3 w-3" />
        All figures are read live from the running backend and refresh every 10 seconds.
      </p>
    </div>
  );
}

function successRate(t: SystemTelemetry): number {
  const done = t.tasks.completed;
  const failed = t.tasks.failed;
  return done + failed > 0 ? Math.round((done / (done + failed)) * 100) : 100;
}

function loadingText(isLoading: boolean): string {
  return isLoading ? "…" : "—";
}

function Skeleton() {
  return <div className="h-24 animate-pulse rounded-lg bg-surface-2" />;
}

function Metric({
  label,
  value,
  hint,
  icon,
  tone = "text-foreground",
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-brand">
          {icon}
        </span>
      </div>
      <p className={`mt-3 font-mono text-2xl font-bold ${tone}`}>{value}</p>
      <p className="mt-1 text-xs text-faint">{hint}</p>
    </Card>
  );
}

function MiniStat({
  label,
  value,
  tone = "text-foreground",
  mono,
}: {
  label: string;
  value: string;
  tone?: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">{label}</p>
      <p className={`mt-1 text-lg font-bold ${mono ? "font-mono text-base" : ""} ${tone}`}>{value}</p>
    </div>
  );
}
