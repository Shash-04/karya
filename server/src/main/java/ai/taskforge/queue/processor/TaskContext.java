package ai.taskforge.queue.processor;

import ai.taskforge.domain.enums.TaskType;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.UUID;

/**
 * Immutable snapshot handed to a processor, decoupling it from the JPA entity so
 * no database transaction is held while the (potentially slow) work runs.
 *
 * @param attempts the current attempt number (1-based)
 */
public record TaskContext(UUID id, TaskType type, JsonNode payload, int attempts) {
}
