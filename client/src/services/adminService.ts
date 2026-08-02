import { api } from "@/lib/api";
import type {
  ApiResponse,
  PageResponse,
  QueueMetrics,
  Task,
  UserSummary,
} from "@/lib/types";
import type { TaskListParams } from "./taskService";

export const adminService = {
  async allTasks(params: TaskListParams): Promise<PageResponse<Task>> {
    const { data } = await api.get<ApiResponse<PageResponse<Task>>>("/admin/tasks", { params });
    return data.data;
  },
  async users(page: number, size: number): Promise<PageResponse<UserSummary>> {
    const { data } = await api.get<ApiResponse<PageResponse<UserSummary>>>("/admin/users", {
      params: { page, size },
    });
    return data.data;
  },
  async queueMetrics(): Promise<QueueMetrics> {
    const { data } = await api.get<ApiResponse<QueueMetrics>>("/admin/queue/metrics");
    return data.data;
  },
};
