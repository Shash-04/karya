import { api } from "@/lib/api";
import type {
  ApiResponse,
  Attachment,
  PageResponse,
  Task,
  TaskDetail,
  TaskStats,
  TaskStatus,
  TaskType,
} from "@/lib/types";

export interface TaskListParams {
  search?: string;
  status?: TaskStatus;
  type?: TaskType;
  page?: number;
  size?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface CreateTaskInput {
  name: string;
  description?: string;
  type: TaskType;
  priority?: number;
  payload?: unknown;
  scheduledAt?: string;
}

export interface UpdateTaskInput {
  name?: string;
  description?: string;
  priority?: number;
  payload?: unknown;
}

export const taskService = {
  async list(params: TaskListParams): Promise<PageResponse<Task>> {
    const { data } = await api.get<ApiResponse<PageResponse<Task>>>("/tasks", { params });
    return data.data;
  },
  async get(id: string): Promise<TaskDetail> {
    const { data } = await api.get<ApiResponse<TaskDetail>>(`/tasks/${id}`);
    return data.data;
  },
  async create(input: CreateTaskInput): Promise<Task> {
    const { data } = await api.post<ApiResponse<Task>>("/tasks", input);
    return data.data;
  },
  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, input);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
  async retry(id: string): Promise<Task> {
    const { data } = await api.post<ApiResponse<Task>>(`/tasks/${id}/retry`);
    return data.data;
  },
  async stats(): Promise<TaskStats> {
    const { data } = await api.get<ApiResponse<TaskStats>>("/tasks/stats/summary");
    return data.data;
  },
  async attachments(id: string): Promise<Attachment[]> {
    const { data } = await api.get<ApiResponse<Attachment[]>>(`/tasks/${id}/attachments`);
    return data.data;
  },
  async upload(id: string, file: File): Promise<Attachment> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post<ApiResponse<Attachment>>(`/tasks/${id}/attachments`, form);
    return data.data;
  },
  async download(taskId: string, attachmentId: string): Promise<Blob> {
    const res = await api.get(`/tasks/${taskId}/attachments/${attachmentId}`, {
      responseType: "blob",
    });
    return res.data as Blob;
  },
};

/** Fetch an attachment (with auth) and save it to disk in the browser. */
export async function saveAttachment(taskId: string, attachmentId: string, filename: string) {
  const blob = await taskService.download(taskId, attachmentId);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
