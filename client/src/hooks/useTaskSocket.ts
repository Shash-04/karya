"use client";

import { Client } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { WS_URL } from "@/lib/config";
import { tokenStore } from "@/lib/tokenStore";
import type { PageResponse, Task, TaskDetail, TaskUpdate } from "@/lib/types";

/**
 * Subscribes to the current user's live task updates over STOMP and patches the
 * TanStack Query caches so the dashboard and detail views update in real time.
 */
export function useTaskSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!tokenStore.getAccess()) return;

    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 3000,
      // Re-read the (possibly refreshed) token on every (re)connect.
      beforeConnect: () => {
        client.connectHeaders = { Authorization: `Bearer ${tokenStore.getAccess() ?? ""}` };
      },
    });

    client.onConnect = () => {
      client.subscribe("/user/queue/tasks", (message) => {
        const update: TaskUpdate = JSON.parse(message.body);

        // Patch the task inside any cached list pages.
        queryClient.setQueriesData<PageResponse<Task>>({ queryKey: ["tasks"] }, (old) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.map((t) =>
              t.id === update.taskId
                ? { ...t, status: update.status, progress: update.progress, attempts: update.attempts }
                : t
            ),
          };
        });

        // Patch the detail cache if open.
        queryClient.setQueryData<TaskDetail>(["task", update.taskId], (old) =>
          old
            ? {
                ...old,
                task: {
                  ...old.task,
                  status: update.status,
                  progress: update.progress,
                  attempts: update.attempts,
                },
              }
            : old
        );

        // Refresh aggregate counts and the detail's log list.
        queryClient.invalidateQueries({ queryKey: ["task-stats"] });
        queryClient.invalidateQueries({ queryKey: ["task", update.taskId] });
      });
    };

    client.activate();
    return () => {
      void client.deactivate();
    };
  }, [queryClient]);
}
