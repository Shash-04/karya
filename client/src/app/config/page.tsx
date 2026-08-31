"use client";

import { Cpu, Globe, KeyRound, RefreshCcw, Server, Settings2, ShieldCheck, Timer } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { useSystemConfig } from "@/hooks/useSystem";
import type { SystemConfig } from "@/lib/types";

export default function ConfigPage() {
  return (
    <AuthGuard>
      <AppShell>
        <ConfigContent />
      </AppShell>
    </AuthGuard>
  );
}

/** Render a millisecond duration as a compact human string (e.g. 900000 -> "15m"). */
function humanMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${trim(s)}s`;
  const m = s / 60;
  if (m < 60) return `${trim(m)}m`;
  const h = m / 60;
  if (h < 24) return `${trim(h)}h`;
  return `${trim(h / 24)}d`;
}

function trim(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function ConfigContent() {
  const { data, isLoading, isError } = useSystemConfig();

  return (
    <div>
      <PageHeader
        kicker={
          <>
            <Settings2 className="h-3.5 w-3.5" /> System Parameters
          </>
        }
        title="Engine &amp; Queue System Configuration"
        subtitle="Effective, non-sensitive configuration for this deployment — read live from the backend."
      />

      {isError && (
        <Card className="p-5 text-sm text-muted">
          Could not load configuration from the server.
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
            <Cpu className="h-4 w-4 text-brand" /> Worker &amp; Queue
          </h2>
          <div className="space-y-3">
            <Row
              icon={<Cpu className="h-4 w-4" />}
              label="Worker Concurrency"
              hint="Parallel job processing threads (core–max)"
              badge={fmt(data, (c) => `${c.worker.corePoolSize}–${c.worker.maxPoolSize} threads`, isLoading)}
              tone="bg-brand-soft text-brand"
            />
            <Row
              icon={<RefreshCcw className="h-4 w-4" />}
              label="Retry Strategy"
              hint="Fixed-delay backoff before re-queue"
              badge={fmt(data, (c) => `Fixed ${humanMs(c.queue.retryDelayMs)} delay`, isLoading)}
              tone="bg-emerald-50 text-emerald-700"
            />
            <Row
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Max Retry Attempts"
              hint="Attempts before marking FAILED"
              badge={fmt(data, (c) => `${c.queue.maxAttempts} attempts`, isLoading)}
              tone="bg-violet-50 text-violet-700"
            />
            <Row
              icon={<Timer className="h-4 w-4" />}
              label="Queue Poll Interval"
              hint="How often the poller promotes due work"
              badge={fmt(data, (c) => humanMs(c.queue.pollIntervalMs), isLoading)}
              mono
            />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
            <ShieldCheck className="h-4 w-4 text-brand" /> Security &amp; Limits
          </h2>
          <div className="space-y-3">
            <Row
              icon={<KeyRound className="h-4 w-4" />}
              label="JWT Token Lifetimes"
              hint="Access &amp; refresh token expiry"
              badge={fmt(
                data,
                (c) => `${humanMs(c.jwt.accessExpiryMs)} / ${humanMs(c.jwt.refreshExpiryMs)}`,
                isLoading
              )}
              tone="bg-amber-50 text-amber-700"
            />
            <Row
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Auth Rate Limit"
              hint="Login / register requests per window"
              badge={fmt(
                data,
                (c) => `${c.rateLimit.authLimit} / ${c.rateLimit.authWindowSeconds}s`,
                isLoading
              )}
              mono
            />
            <Row
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Task-Create Rate Limit"
              hint="Task creations per window"
              badge={fmt(
                data,
                (c) => `${c.rateLimit.taskCreateLimit} / ${c.rateLimit.taskCreateWindowSeconds}s`,
                isLoading
              )}
              mono
            />
            <Row
              icon={<Server className="h-4 w-4" />}
              label="Max Upload Size"
              hint="Per-file attachment limit"
              badge={fmt(data, (c) => c.storage.maxFileSize, isLoading)}
              mono
            />
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
            <Globe className="h-4 w-4 text-brand" /> Environment
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Row
              icon={<Server className="h-4 w-4" />}
              label="Active Profiles"
              hint="Spring profiles in effect"
              badge={fmt(
                data,
                (c) => (c.activeProfiles.length ? c.activeProfiles.join(", ") : "default"),
                isLoading
              )}
              mono
            />
            <Row
              icon={<Globe className="h-4 w-4" />}
              label="Allowed Origins"
              hint="CORS — permitted frontend origins"
              badge={fmt(data, (c) => `${c.corsAllowedOrigins.length} origin(s)`, isLoading)}
              tone="bg-emerald-50 text-emerald-700"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

/** Format a config-derived badge, showing a placeholder while loading/absent. */
function fmt(
  data: SystemConfig | undefined,
  pick: (c: SystemConfig) => string,
  isLoading: boolean
): string {
  if (data) return pick(data);
  return isLoading ? "…" : "—";
}

function Row({
  icon,
  label,
  hint,
  badge,
  tone = "bg-stone-100 text-stone-700",
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  badge: string;
  tone?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-muted">
          {icon}
        </span>
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-faint">{hint}</p>
        </div>
      </div>
      <span
        className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-bold ${tone} ${mono ? "font-mono" : ""}`}
      >
        {badge}
      </span>
    </div>
  );
}
