"use client";

import { useQuery } from "@tanstack/react-query";
import { systemService } from "@/services/systemService";

/** Effective config rarely changes at runtime — cache it for a minute. */
export function useSystemConfig() {
  return useQuery({
    queryKey: ["system-config"],
    queryFn: () => systemService.config(),
    staleTime: 60_000,
  });
}

/** Live telemetry — poll on an interval so the figures stay current. */
export function useSystemTelemetry(refetchInterval = 10_000) {
  return useQuery({
    queryKey: ["system-telemetry"],
    queryFn: () => systemService.telemetry(),
    refetchInterval,
  });
}
