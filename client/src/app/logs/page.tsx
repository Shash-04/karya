"use client";

import { useMemo, useState } from "react";
import { Search, TerminalSquare } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader, LiveKicker } from "@/components/PageHeader";

type Level = "INFO" | "WARN" | "ERROR";
interface Line {
  ts: string;
  level: Level;
  source: string;
  message: string;
}

const LOGS: Line[] = [
  { ts: "20:30:12", level: "INFO", source: "WorkerPool", message: "[Worker Process] Initialized task worker pool with concurrency = 5" },
  { ts: "20:31:05", level: "INFO", source: "TaskService", message: "Processing Job #task_9021 (Type: REPORT_GENERATION, Priority: 3)" },
  { ts: "20:31:06", level: "INFO", source: "SocketEngine", message: "Broadcasted `task:progress` event over STOMP → Progress: 50%" },
  { ts: "20:31:08", level: "INFO", source: "TaskService", message: "Job #task_9021 COMPLETED in 2.4s — result persisted to PostgreSQL" },
  { ts: "20:32:15", level: "WARN", source: "WorkerPool", message: "Task #task_7812 rate-limit threshold warning: 85% queue capacity" },
  { ts: "20:33:01", level: "ERROR", source: "TaskProcessor", message: "Job #task_4412 FAILED: connection timeout connecting to target host" },
  { ts: "20:33:04", level: "INFO", source: "RetryScheduler", message: "Scheduled retry for #task_4412 with exponential backoff (attempt 2/3)" },
  { ts: "20:34:22", level: "INFO", source: "TaskService", message: "Job #task_9105 COMPLETED in 1.1s — 4820 chars extracted" },
  { ts: "20:35:40", level: "WARN", source: "RedisTransport", message: "Reconnect: BullMQ Redis connection re-established on port 6379" },
];

const LEVELS: (Level | "ALL")[] = ["ALL", "INFO", "WARN", "ERROR"];

const levelStyle: Record<Level, string> = {
  INFO: "bg-sky-500/15 text-sky-300",
  WARN: "bg-amber-500/15 text-amber-300",
  ERROR: "bg-red-500/15 text-red-300",
};

export default function LogsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <LogsContent />
      </AppShell>
    </AuthGuard>
  );
}

function LogsContent() {
  const [level, setLevel] = useState<Level | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      LOGS.filter((l) => level === "ALL" || l.level === level).filter(
        (l) => !search || l.message.toLowerCase().includes(search.toLowerCase())
      ),
    [level, search]
  );

  return (
    <div>
      <PageHeader
        kicker={<LiveKicker label="Audit Trail" />}
        title="System &amp; Worker Execution Audit Logs"
        subtitle="Searchable live execution stream, error stack traces, and worker event history."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg bg-surface-2 p-1">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                level === l ? "bg-brand text-white shadow-sm" : "text-muted hover:text-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            placeholder="Search log text…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-60 rounded-lg border border-border-strong bg-surface py-2 pl-8 pr-3 text-sm outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
        </div>
      </div>

      <div className="tf-terminal tf-scroll overflow-x-auto rounded-xl2 p-4">
        <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-3 text-xs text-stone-400">
          <TerminalSquare className="h-4 w-4" />
          taskforge-live-telemetry.worker.internal
          <span className="ml-auto flex items-center gap-1.5 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 tf-live-dot" /> STREAM ACTIVE
          </span>
        </div>
        <div className="space-y-1.5 font-mono text-[12px] leading-relaxed">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-stone-500">No log entries match the filter.</p>
          ) : (
            filtered.map((l, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <span className="text-stone-500">2026-08-01 {l.ts}</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${levelStyle[l.level]}`}>
                  {l.level}
                </span>
                <span className="text-stone-400">[{l.source}]</span>
                <span className="text-stone-200">{l.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
