"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { PageHeader, LiveKicker } from "@/components/PageHeader";
import { TaskFormModal } from "@/components/TaskFormModal";
import { TaskQueuePanel } from "@/components/TaskQueuePanel";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function QueuePage() {
  return (
    <AuthGuard>
      <AppShell>
        <QueueContent />
      </AppShell>
    </AuthGuard>
  );
}

function QueueContent() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <PageHeader
        kicker={<LiveKicker label="Live Queue Stream" />}
        title="Task Queue Management"
        subtitle="Inspect, filter, and manage every job flowing through the worker pool."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
                queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
              }}
            >
              <RefreshCw className="h-4 w-4" /> Refresh Queue
            </Button>
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> Create Task
            </Button>
          </>
        }
      />
      <TaskFormModal open={creating} onClose={() => setCreating(false)} mode="create" />
      <TaskQueuePanel admin={isAdmin} />
    </div>
  );
}
