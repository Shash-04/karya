"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ArrowRight,
  Boxes,
  Container,
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
      <main className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <Hero />
        <StatsBand />
        <Features />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-sm shadow-brand/30">
            <Zap className="h-5 w-5 fill-white" />
          </span>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight">TaskForge</span>
              <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand">
                V1.0 Engine
              </span>
            </div>
            <p className="text-[10px] text-faint">Distributed Job Processing Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-muted hover:text-foreground">
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition-colors hover:bg-brand-hover"
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
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
          <Radio className="h-3.5 w-3.5" /> Real-Time STOMP + Redis Architecture
        </span>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
          High-Performance
          <br />
          <span className="text-brand">Async Job Processing</span>
          <br />
          Engine
        </h1>
        <p className="mt-5 max-w-md text-base text-muted">
          Power your background queues, scheduled tasks, and heavy worker processing with Redis
          persistence, automatic retry policies, and live WebSocket telemetry.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-brand/25 transition-colors hover:bg-brand-hover"
          >
            <Zap className="h-4 w-4 fill-white" /> Launch Demo Engine <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2"
          >
            <Lock className="h-4 w-4" /> Sign In with Demo Account
          </Link>
        </div>
      </div>
      <TelemetryPreview />
    </section>
  );
}

function TelemetryPreview() {
  return (
    <div className="tf-terminal rounded-xl2 p-4 shadow-2xl shadow-stone-900/20">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-[11px] text-stone-400">
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-amber-500/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
        </span>
        <span className="font-mono">taskforge.worker.internal</span>
        <span className="ml-auto flex items-center gap-1.5 text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 tf-live-dot" /> ACTIVE POOL
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 py-3">
        {[
          { k: "Concurrency", v: "5 Workers" },
          { k: "Job Progress", v: "100%" },
          { k: "Redis Latency", v: "< 1.8 ms" },
        ].map((m) => (
          <div key={m.k} className="rounded-lg bg-white/5 p-2.5">
            <p className="text-[9px] uppercase tracking-wide text-stone-500">{m.k}</p>
            <p className="mt-1 font-mono text-sm font-bold text-brand">{m.v}</p>
          </div>
        ))}
      </div>
      <div className="space-y-1 font-mono text-[11px] leading-relaxed">
        <p className="text-stone-400">
          <span className="text-stone-500">[19:42:01]</span> ⚡ Worker pool initialized on Redis :6379
        </p>
        <p className="text-stone-400">
          <span className="text-stone-500">[19:42:05]</span> 🔄 Processing #task_8921 (REPORT_GEN, P3)
        </p>
        <p className="text-stone-400">
          <span className="text-stone-500">[19:42:06]</span> 📡 Broadcast `task:progress` → 100%
        </p>
        <p className="text-emerald-400">
          <span className="text-stone-500">[19:42:08]</span> ✅ #task_8921 COMPLETED in 2.4s
        </p>
      </div>
    </div>
  );
}

const STATS = [
  { v: "99.99%", k: "Queue Uptime SLA" },
  { v: "5,000+", k: "Jobs / sec Scalability" },
  { v: "< 2 ms", k: "Sub-ms Queue Latency" },
  { v: "100%", k: "RBAC Multi-Tenant" },
];

function StatsBand() {
  return (
    <section className="grid grid-cols-2 gap-4 rounded-xl2 border border-border bg-surface p-6 md:grid-cols-4">
      {STATS.map((s) => (
        <div key={s.k} className="text-center">
          <p className="text-2xl font-extrabold text-brand md:text-3xl">{s.v}</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-faint">{s.k}</p>
        </div>
      ))}
    </section>
  );
}

const FEATURES = [
  {
    icon: Boxes,
    tag: "Core Queue Engine",
    title: "Redis Queue Engine",
    body: "Background job processing backed by Redis with a ready list, delayed zset, and automatic retry-with-backoff.",
  },
  {
    icon: Radio,
    tag: "Sub-10ms Streaming",
    title: "Real-Time WebSocket Streams",
    body: "Live task state pushed over STOMP so the dashboard updates instantly — no polling overhead.",
  },
  {
    icon: ShieldCheck,
    tag: "JWT & Admin",
    title: "Role-Based Security (RBAC)",
    body: "Multi-tenant data isolation with dual JWT access & refresh rotation and global admin oversight.",
  },
  {
    icon: Gauge,
    tag: "Concurrency 5x",
    title: "Multi-Worker Pool",
    body: "A dedicated thread pool processes emails, reports, exports, image jobs, and webhooks in parallel.",
  },
  {
    icon: ScrollText,
    tag: "Audit Trail",
    title: "Deep Execution Logs",
    body: "Step-by-step audit logs, execution timing, payload inspection, and full error capture per task.",
  },
  {
    icon: Container,
    tag: "CI/CD Ready",
    title: "Docker Containerized",
    body: "One command brings up Postgres, Redis, and the Spring Boot backend via docker-compose.",
  },
];

function Features() {
  return (
    <section className="py-16">
      <div className="mb-10 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-brand">
          Built for Modern Scale
        </span>
        <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
          Everything you need for fault-tolerant background workflows
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="rounded-xl2 border border-border bg-surface p-5 transition-colors hover:border-brand/40"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-soft text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-wide text-faint">{f.tag}</p>
              <h3 className="mt-1 text-base font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mb-16 rounded-xl2 border border-brand/20 bg-gradient-to-br from-brand-soft to-brand-softer p-10 text-center">
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
        Ready to experience TaskForge in action?
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        Test background task execution, real-time progress bars, and global administrative
        permissions today.
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
          TaskForge Engine v1.0 — Built with Next.js, Spring Boot, PostgreSQL &amp; Redis
        </p>
        <p>© 2026 TaskForge Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}
