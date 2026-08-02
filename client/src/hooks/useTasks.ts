"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CreateTaskInput,
  TaskListParams,
  UpdateTaskInput,
  taskService,
} from "@/services/taskService";

export function useTasks(params: TaskListParams) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => taskService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useTaskStats() {
  return useQuery({ queryKey: ["task-stats"], queryFn: () => taskService.stats() });
}

export function useTask(id: string | null) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => taskService.get(id as string),
    enabled: !!id,
  });
}

/** Invalidate the list, stats, and (optionally) a single task after a mutation. */
function useTaskInvalidation() {
  const queryClient = useQueryClient();
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["task-stats"] });
    if (id) queryClient.invalidateQueries({ queryKey: ["task", id] });
  };
}

export function useCreateTask() {
  const invalidate = useTaskInvalidation();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => taskService.create(input),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateTask() {
  const invalidate = useTaskInvalidation();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      taskService.update(id, input),
    onSuccess: (task) => invalidate(task.id),
  });
}

export function useDeleteTask() {
  const invalidate = useTaskInvalidation();
  return useMutation({
    mutationFn: (id: string) => taskService.remove(id),
    onSuccess: () => invalidate(),
  });
}

export function useRetryTask() {
  const invalidate = useTaskInvalidation();
  return useMutation({
    mutationFn: (id: string) => taskService.retry(id),
    onSuccess: (task) => invalidate(task.id),
  });
}
