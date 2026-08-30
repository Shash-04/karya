"use client";

import { ReactNode, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTaskSocket } from "@/hooks/useTaskSocket";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { connected } = useTaskSocket();
  const [drawer, setDrawer] = useState(false);

  const initial = (user?.name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-full flex-1">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border md:block">
        <div className="sticky top-0 h-screen">
          <Sidebar role={user?.role} />
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-stone-900/40" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 h-full w-64 border-r border-border shadow-xl">
            <Sidebar role={user?.role} onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-surface/80 px-4 py-3 backdrop-blur md:px-6">
          <button
            className="rounded-md p-1.5 text-muted hover:bg-surface-2 md:hidden"
            onClick={() => setDrawer((d) => !d)}
            aria-label="Toggle navigation"
          >
            {drawer ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <ConnectionPill connected={connected} />

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 sm:flex">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                {initial}
              </span>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold">{user?.name ?? "User"}</span>
                  {user?.role === "ADMIN" && (
                    <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-700">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-faint">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}

function ConnectionPill({ connected }: { connected: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
        connected
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-500" : "bg-amber-500 tf-live-dot"}`}
      />
      {connected ? "Sockets & Redis Connected" : "Connecting Sockets…"}
    </span>
  );
}
