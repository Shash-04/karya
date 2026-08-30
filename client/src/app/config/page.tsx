"use client";

import { Cpu, Database, KeyRound, RefreshCcw, Server, Settings2, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";

export default function ConfigPage() {
  return (
    <AuthGuard>
      <AppShell>
        <ConfigContent />
      </AppShell>
    </AuthGuard>
  );
}

function ConfigContent() {
  return (
    <div>
      <PageHeader
        kicker={
          <>
            <Settings2 className="h-3.5 w-3.5" /> System Parameters
          </>
        }
        title="Engine &amp; Queue System Configuration"
        subtitle="Worker concurrency, retry policy, and infrastructure environment for this deployment."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
            <Cpu className="h-4 w-4 text-brand" /> Worker Concurrency Settings
          </h2>
          <div className="space-y-3">
            <Row
              icon={<Cpu className="h-4 w-4" />}
              label="Max Worker Concurrency"
              hint="Parallel job processing threads"
              badge="5 Threads"
              tone="bg-brand-soft text-brand"
            />
            <Row
              icon={<RefreshCcw className="h-4 w-4" />}
              label="Retry Strategy"
              hint="Exponential backoff algorithm"
              badge="2x Exponential"
              tone="bg-emerald-50 text-emerald-700"
            />
            <Row
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Max Retry Attempts"
              hint="Attempts before marking FAILED"
              badge="3 Attempts"
              tone="bg-violet-50 text-violet-700"
            />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
            <Server className="h-4 w-4 text-brand" /> Infrastructure Environment
          </h2>
          <div className="space-y-3">
            <Row
              icon={<Database className="h-4 w-4" />}
              label="Redis Host Connection"
              hint="Queue &amp; rate-limit broker"
              badge="localhost:6379"
              mono
            />
            <Row
              icon={<Database className="h-4 w-4" />}
              label="PostgreSQL Database"
              hint="Spring Data JPA · Flyway migrations"
              badge="Connected"
              tone="bg-emerald-50 text-emerald-700"
            />
            <Row
              icon={<KeyRound className="h-4 w-4" />}
              label="JWT Token Security"
              hint="Dual access &amp; refresh token expiry"
              badge="15m Access / 7d Refresh"
              tone="bg-amber-50 text-amber-700"
            />
          </div>
        </Card>
      </div>
    </div>
  );
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
