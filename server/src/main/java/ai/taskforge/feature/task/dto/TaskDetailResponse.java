package ai.taskforge.feature.task.dto;

import java.util.List;

/** A task plus its execution log lines. */
public record TaskDetailResponse(TaskResponse task, List<TaskLogResponse> logs) {
}
