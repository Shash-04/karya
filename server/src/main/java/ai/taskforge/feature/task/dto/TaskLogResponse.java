package ai.taskforge.feature.task.dto;

import ai.taskforge.domain.entity.TaskLog;
import java.time.Instant;

public record TaskLogResponse(Long id, String level, String message, Instant createdAt) {

    public static TaskLogResponse from(TaskLog log) {
        return new TaskLogResponse(log.getId(), log.getLevel(), log.getMessage(), log.getCreatedAt());
    }
}
