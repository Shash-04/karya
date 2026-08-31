"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Activity,
  ArrowRight,
  Boxes,
  Clock,
  Gauge,
  Lock,
  Radio,
  ScrollText,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useAppSelector } from "@/store/hooks";

export default function Home() {
  const { status } = useAppSelector((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  if (status !== "unauthenticated") {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <SiteHeader />
      <main>
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <Hero />
        </div>
        <StatsBand />
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <Features />
          <Pipeline />
          <FinalCta />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-white shadow-sm shadow-brand/30">
        <Zap className="h-6 w-6 fill-white" />
      </span>
      <div className="leading-tight">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight">Karya</span>
          <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
            V1.0 Engine
          </span>
        </div>
        <p className="text-[11px] text-faint">Distributed Job Processing Platform</p>
      </div>
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <BrandMark />
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-muted hover:text-foreground">
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition-colors hover:bg-brand-hover"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand">
          <span className="h-1.5 w-1.5 rounded-full bg-brand tf-live-dot" /> Real-Time STOMP + Redis Architecture
        </span>
        <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-tight md:text-6xl">
          High-Performance
          <br />
          <span className="bg-gradient-to-r from-brand to-amber-500 bg-clip-text text-transparent">
            Async Job Processing
          </span>
          <br />
          Engine
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
          Power your background queues, scheduled tasks, and heavy worker processing with Redis
          persistence, automatic retry policies, and live WebSocket telemetry metrics.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-base font-semibold text-white shadow-sm shadow-brand/25 transition-colors hover:bg-brand-hover"
          >
            <Zap className="h-5 w-5 fill-white" /> Launch Demo Engine <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-surface px-6 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-surface-2"
          >
            <Lock className="h-5 w-5" /> Sign In with Demo Account
          </Link>
        </div>
      </div>
      <TelemetryPreview />
    </section>
  );
}

function TelemetryPreview() {
  return (
    <div className="tf-terminal rounded-xl2 p-5 shadow-2xl shadow-stone-900/30">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 text-[11px] text-stone-400">
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-amber-500/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
        </span>
        <span className="ml-1 truncate font-mono">karya-live-telemetry.worker.internal</span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5 font-mono text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 tf-live-dot" /> ACTIVE
        </span>
      </div>

      {/* metric cards */}
      <div className="grid grid-cols-3 gap-3 py-4">
        <MetricCard
          icon={Gauge}
          label="Active Worker Pool"
          value="4–8"
          unit="Threads"
          sub="Core 4 · Max 8"
        />
        <MetricCard
          icon={Activity}
          label="Job Progress"
          value="100%"
          unit="Complete"
          bar
        />
        <MetricCard
          icon={Zap}
          label="Redis Queue Latency"
          value="< 2 ms"
          unit=""
          sub="STOMP stream active"
        />
      </div>

      {/* execution stream */}
      <div className="rounded-xl border border-white/10 bg-black/40 p-4">
        <p className="mb-3 flex items-center gap-2 font-mono text-[11px] font-bold text-brand">
          <span className="text-stone-500">{">_"}</span> Karya Execution Stream Terminal
        </p>
        <div className="space-y-2 font-mono text-[11px] leading-relaxed">
          <p className="text-amber-300/90">
            <span className="text-stone-600">[19:42:01]</span> ⚡ Worker pool initialized · Redis :6379
          </p>
          <p className="text-amber-300/90">
            <span className="text-stone-600">[19:42:05]</span> 🔄 [Worker] Processing #task_8921 (REPORT, P3)
          </p>
          <p className="text-sky-300/90">
            <span className="text-stone-600">[19:42:06]</span> 📡 [STOMP] Broadcast `task:progress` → 100%
          </p>
          <p className="font-semibold text-emerald-400">
            <span className="text-stone-600">[19:42:08]</span> ✅ [TaskWorker] #task_8921 COMPLETED in 2.4s
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  sub,
  bar,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  unit: string;
  sub?: string;
  bar?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-start justify-between">
        <p className="text-[9px] uppercase leading-tight tracking-wide text-stone-500">{label}</p>
        <Icon className="h-3.5 w-3.5 shrink-0 text-brand/70" />
      </div>
      <p className="mt-2 font-mono text-base font-bold leading-none text-brand">{value}</p>
      {unit ? <p className="mt-1 font-mono text-[11px] font-semibold text-emerald-400">{unit}</p> : null}
      {bar ? (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full rounded-full bg-emerald-400" />
        </div>
      ) : null}
      {sub ? <p className="mt-1.5 text-[9px] leading-tight text-stone-500">{sub}</p> : null}
    </div>
  );
}

const STATS = [
  { v: "99.99%", k: "Queue Uptime SLA", brand: false },
  { v: "5,000+", k: "Jobs / Sec Scalability", brand: true },
  { v: "< 2 ms", k: "Sub-ms Queue Latency", brand: true },
  { v: "100%", k: "RBAC Multi-Tenant", brand: false },
];

function StatsBand() {
  return (
    <section className="mt-10 border-y border-border bg-surface">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-6 py-14 md:grid-cols-4 md:gap-x-4">
        {STATS.map((s) => (
          <div key={s.k} className="text-center">
            <p
              className={`text-4xl font-extrabold tracking-tight md:text-5xl ${
                s.brand ? "text-brand" : "text-foreground"
              }`}
            >
              {s.v}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-faint md:text-sm">
              {s.k}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Boxes,
    color: "bg-orange-50 text-orange-600",
    tag: "Core Queue",
    title: "Redis-Backed Queue",
    body: "Ready work goes to a Redis list (LPUSH/RPOP); scheduled and retrying jobs wait in a sorted set scored by run time, promoted when due.",
  },
  {
    icon: Radio,
    color: "bg-sky-50 text-sky-600",
    tag: "STOMP over WebSocket",
    title: "Real-Time WebSocket Streams",
    body: "Status and progress changes are broadcast over STOMP the moment they happen, so the dashboard reflects worker state without polling.",
  },
  {
    icon: ShieldCheck,
    color: "bg-violet-50 text-violet-600",
    tag: "JWT & Admin",
    title: "Role-Based Security (RBAC)",
    body: "Short-lived access tokens (15 min) with 7-day refresh rotation, USER/ADMIN roles, and per-user task isolation with admin oversight.",
  },
  {
    icon: Gauge,
    color: "bg-emerald-50 text-emerald-600",
    tag: "4 Core · 8 Max",
    title: "Concurrent Worker Pool",
    body: "A tuned ThreadPoolTaskExecutor (4–8 threads, 100-deep queue) runs jobs in parallel, with caller-runs backpressure when saturated.",
  },
  {
    icon: Clock,
    color: "bg-amber-50 text-amber-600",
    tag: "Backoff + Scheduling",
    title: "Retries & Delayed Jobs",
    body: "Failed jobs are re-enqueued up to 3 times with a fixed backoff delay. Schedule work for later by dropping it into the delayed set.",
  },
  {
    icon: ScrollText,
    color: "bg-rose-50 text-rose-600",
    tag: "Audit Trail",
    title: "Deep Execution Logs",
    body: "Every task keeps a timestamped log of its run — attempts, progress, results, and captured error messages, viewable per task.",
  },
];

function Features() {
  return (
    <section className="py-20">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-soft px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand">
          <Gauge className="h-3.5 w-3.5" /> Built for Modern Scale
        </span>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
          Everything You Need for{" "}
          <span className="text-brand">Fault-Tolerant Background Workflows</span>
        </h2>
        <p className="mt-4 text-base text-muted">
          Engineered with a modular architecture, strict validation, and real-time observability
          from queue to completion.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="rounded-xl2 border border-border bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-stone-900/5"
            >
              <span className={`grid h-12 w-12 place-items-center rounded-xl ${f.color}`}>
                <Icon className="h-6 w-6" />
              </span>
              <p className="mt-5 text-[10px] font-bold uppercase tracking-wide text-faint">{f.tag}</p>
              <h3 className="mt-1.5 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Enqueue a task",
    body: "Submit a job with a type, priority (P1–P4), payload, and optional schedule. It lands in Redis as ready or delayed.",
  },
  {
    n: "02",
    title: "Workers pick it up",
    body: "A poller moves due jobs into the ready list; free worker threads RPOP the next task and start executing.",
  },
  {
    n: "03",
    title: "Progress streams live",
    body: "As the job runs, status and progress are broadcast over STOMP and land on your dashboard in real time.",
  },
  {
    n: "04",
    title: "Retry or complete",
    body: "On success it's marked COMPLETED; on failure it's re-queued with backoff, up to three attempts, with logs kept throughout.",
  },
];

function Pipeline() {
  return (
    <section className="pb-16">
      <div className="mb-10 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-brand">
          How it works
        </span>
        <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
          From enqueue to completion
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-xl2 border border-border bg-surface p-5">
            <span className="font-mono text-lg font-extrabold text-brand/40">{s.n}</span>
            <h3 className="mt-2 text-base font-bold">{s.title}</h3>
            <p className="mt-1.5 text-sm text-muted">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mb-16 rounded-xl2 border border-brand/20 bg-gradient-to-br from-brand-soft to-brand-softer p-10 text-center">
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">See Karya process a job</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        Enqueue tasks, watch progress stream in live, trigger a retry, and explore the admin view —
        all from the demo.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-brand/25 transition-colors hover:bg-brand-hover"
        >
          Create Free Account <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2"
        >
          Sign In to Demo
        </Link>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-1 px-4 text-center text-xs text-faint md:px-6">
        <p className="font-semibold text-muted">
          Karya — Built with Next.js, Spring Boot, PostgreSQL &amp; Redis
        </p>
        <p>© 2026 Karya. All rights reserved.</p>
      </div>
    </footer>
  );
}
