package ai.taskforge.feature.task.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/** Partial update; only non-null fields are applied. Allowed only while PENDING. */
public record UpdateTaskRequest(
        @Size(max = 200) String name,
        @Size(max = 5000) String description,
        @PositiveOrZero Integer priority,
        JsonNode payload) {
}
