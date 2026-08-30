"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Database,
  LayoutDashboard,
  ListChecks,
  ScrollText,
  Server,
  Settings2,
  Users,
  Zap,
} from "lucide-react";
import type { Role } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  live?: boolean;
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/queue", label: "Task Queue", icon: ListChecks, live: true },
  { href: "/telemetry", label: "BullMQ Telemetry", icon: Activity },
  { href: "/logs", label: "Task Logs", icon: ScrollText },
  { href: "/config", label: "System Config", icon: Settings2 },
  { href: "/admin", label: "Users", icon: Users, adminOnly: true },
];

export function Sidebar({ role, onNavigate }: { role?: Role; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-sm shadow-brand/30">
          <Zap className="h-5 w-5 fill-white" />
        </span>
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight">TaskForge</span>
            <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand">
              Pro
            </span>
          </div>
          <p className="text-[10px] text-faint">Async Job &amp; Queue Engine</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-faint">
          Core Platform
        </p>
        <ul className="space-y-1">
          {NAV.filter((n) => !n.adminOnly || role === "ADMIN").map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-soft text-brand"
                      : "text-muted hover:bg-surface-2 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span className="flex-1">{item.label}</span>
                  {item.live && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-600">
                      <span className="h-1 w-1 rounded-full bg-emerald-500 tf-live-dot" />
                      Live
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Worker pool status widget */}
      <div className="border-t border-border p-3">
        <div className="rounded-xl border border-border bg-surface-2 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
            <Server className="h-3.5 w-3.5" />
            Worker Pool Status
          </div>
          <dl className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1.5 text-faint">
                <Zap className="h-3 w-3" /> Queue
              </dt>
              <dd className="font-medium text-emerald-600">Active (5 workers)</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1.5 text-faint">
                <Database className="h-3 w-3" /> Redis Host
              </dt>
              <dd className="font-mono text-foreground">localhost:6379</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1.5 text-faint">
                <Database className="h-3 w-3" /> Postgres
              </dt>
              <dd className="font-medium text-foreground">Spring JPA</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
