// Types mirroring the backend DTOs and response envelope.

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  error: ApiError | null;
  timestamp: string;
}

export interface ApiError {
  code: string;
  details?: Record<string, string> | null;
}

export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export type TaskStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type TaskType =
  | "EMAIL"
  | "REPORT"
  | "DATA_EXPORT"
  | "IMAGE_PROCESSING"
  | "WEBHOOK"
  | "GENERIC";

export interface Task {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: number;
  payload: unknown;
  result: unknown;
  errorMessage: string | null;
  attempts: number;
  progress: number;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskLog {
  id: number;
  level: string;
  message: string;
  createdAt: string;
}

export interface TaskDetail {
  task: Task;
  logs: TaskLog[];
}

export interface TaskStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  queued: number;
  scheduled: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface Attachment {
  id: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
}

// Live update pushed over WebSocket (/user/queue/tasks).
export interface TaskUpdate {
  taskId: string;
  status: TaskStatus;
  progress: number;
  attempts: number;
  message: string;
  timestamp: string;
}
