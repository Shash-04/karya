import { api } from "@/lib/api";
import type { ApiResponse, SystemConfig, SystemTelemetry } from "@/lib/types";

export const systemService = {
  async config(): Promise<SystemConfig> {
    const { data } = await api.get<ApiResponse<SystemConfig>>("/system/config");
    return data.data;
  },
  async telemetry(): Promise<SystemTelemetry> {
    const { data } = await api.get<ApiResponse<SystemTelemetry>>("/system/telemetry");
    return data.data;
  },
};
