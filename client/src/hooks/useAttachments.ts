"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/services/taskService";

export function useAttachments(taskId: string) {
  return useQuery({
    queryKey: ["attachments", taskId],
    queryFn: () => taskService.attachments(taskId),
    enabled: !!taskId,
  });
}

export function useUploadAttachment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => taskService.upload(taskId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attachments", taskId] }),
  });
}
