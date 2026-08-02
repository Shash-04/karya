package ai.taskforge.feature.task.dto;

import ai.taskforge.domain.enums.TaskType;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.time.Instant;

/**
 * @param payload     optional JSON input for the processor
 * @param scheduledAt optional future time to run the task (otherwise immediate)
 */
public record CreateTaskRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 5000) String description,
        @NotNull TaskType type,
        @PositiveOrZero Integer priority,
        JsonNode payload,
        Instant scheduledAt) {
}
