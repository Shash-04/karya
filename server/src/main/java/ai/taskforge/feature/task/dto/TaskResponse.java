package ai.taskforge.feature.task.dto;

import ai.taskforge.domain.enums.TaskStatus;
import ai.taskforge.domain.enums.TaskType;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        UUID userId,
        String name,
        String description,
        TaskType type,
        TaskStatus status,
        int priority,
        JsonNode payload,
        JsonNode result,
        String errorMessage,
        int attempts,
        int progress,
        Instant scheduledAt,
        Instant createdAt,
        Instant updatedAt) {
}
