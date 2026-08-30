"use client";

import { useState } from "react";
import { ShieldCheck, User as UserIcon, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useAdminUsers } from "@/hooks/useAdmin";
import { formatDateTime } from "@/lib/format";

export default function AdminUsersPage() {
  return (
    <AuthGuard requireAdmin>
      <AppShell>
        <UsersContent />
      </AppShell>
    </AuthGuard>
  );
}

function UsersContent() {
  const [page, setPage] = useState(0);
  const users = useAdminUsers(page);
  const data = users.data;

  return (
    <div>
      <PageHeader
        kicker={
          <>
            <ShieldCheck className="h-3.5 w-3.5" /> Admin · Access Control
          </>
        }
        title="Platform Users"
        subtitle="All registered workspace accounts, their roles, and task activity."
      />

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
          <Users className="h-4 w-4 text-brand" />
          <h2 className="text-sm font-bold">Registered Accounts</h2>
          {data && (
            <span className="ml-auto text-xs text-faint">{data.totalElements} total</span>
          )}
        </div>

        {users.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          <div className="overflow-x-auto tf-scroll">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-faint">
                  <th className="px-5 py-2.5">User</th>
                  <th className="px-5 py-2.5">Role</th>
                  <th className="px-5 py-2.5">Tasks</th>
                  <th className="px-5 py-2.5">Joined</th>
                </tr>
              </thead>
              <tbody>
                {data?.content.map((u) => (
                  <tr key={u.id} className="border-b border-border/70">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                          {(u.name || u.email).charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <div className="font-semibold">{u.name}</div>
                          <div className="text-xs text-faint">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          u.role === "ADMIN"
                            ? "bg-violet-100 text-violet-700"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {u.role === "ADMIN" ? (
                          <ShieldCheck className="h-3 w-3" />
                        ) : (
                          <UserIcon className="h-3 w-3" />
                        )}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 tabular-nums text-muted">{u.totalTasks}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted">
                      {formatDateTime(u.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted">
            <span>
              Page {data.page + 1} of {data.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="px-3 py-1.5"
                disabled={data.page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                className="px-3 py-1.5"
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
