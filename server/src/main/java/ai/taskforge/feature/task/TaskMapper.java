package ai.taskforge.feature.task;

import ai.taskforge.domain.entity.Task;
import ai.taskforge.domain.entity.TaskLog;
import ai.taskforge.feature.task.dto.TaskDetailResponse;
import ai.taskforge.feature.task.dto.TaskLogResponse;
import ai.taskforge.feature.task.dto.TaskResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.springframework.stereotype.Component;

/** Maps task entities to response DTOs, parsing JSONB string columns to JSON. */
@Component
public class TaskMapper {

    private final ObjectMapper objectMapper;

    public TaskMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getUser().getId(),
                task.getName(),
                task.getDescription(),
                task.getType(),
                task.getStatus(),
                task.getPriority(),
                readJson(task.getPayload()),
                readJson(task.getResult()),
                task.getErrorMessage(),
                task.getAttempts(),
                task.getProgress(),
                task.getScheduledAt(),
                task.getCreatedAt(),
                task.getUpdatedAt());
    }

    public TaskDetailResponse toDetail(Task task, List<TaskLog> logs) {
        return new TaskDetailResponse(toResponse(task), logs.stream().map(TaskLogResponse::from).toList());
    }

    /** Serialize a JSON tree to its string form for a JSONB column (null-safe). */
    public String writeJson(JsonNode node) {
        return node == null || node.isNull() ? null : node.toString();
    }

    private JsonNode readJson(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readTree(raw);
        } catch (Exception e) {
            // Stored value isn't parseable JSON; surface it as a JSON string rather than failing.
            return objectMapper.getNodeFactory().textNode(raw);
        }
    }
}
