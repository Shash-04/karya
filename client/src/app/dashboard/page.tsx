"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardInner />
    </AuthGuard>
  );
}

function DashboardInner() {
  const { user, logout } = useAuth();
  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="secondary" onClick={logout}>
          Sign out
        </Button>
      </div>
      <Card className="mt-6 p-6">
        <p className="text-sm text-slate-500">Signed in as</p>
        <p className="text-lg font-medium">{user?.name}</p>
        <p className="text-sm text-slate-500">
          {user?.email} · {user?.role}
        </p>
      </Card>
    </main>
  );
}
