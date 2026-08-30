"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import type { TaskListParams } from "@/services/taskService";

export function useAllTasks(params: TaskListParams, enabled = true) {
  return useQuery({
    queryKey: ["admin-tasks", params],
    queryFn: () => adminService.allTasks(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useAdminUsers(page: number, enabled = true) {
  return useQuery({
    queryKey: ["admin-users", page],
    queryFn: () => adminService.users(page, 20),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useQueueMetrics(enabled = true) {
  return useQuery({
    queryKey: ["queue-metrics"],
    queryFn: () => adminService.queueMetrics(),
    refetchInterval: 5000,
    enabled,
  });
}
