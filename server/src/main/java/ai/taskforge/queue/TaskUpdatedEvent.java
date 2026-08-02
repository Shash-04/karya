package ai.taskforge.queue;

import ai.taskforge.domain.enums.TaskStatus;
import java.util.UUID;

/**
 * Published whenever a task's status or progress changes during execution.
 * Consumed by the WebSocket layer to notify the owning user.
 */
public record TaskUpdatedEvent(
        UUID userId,
        UUID taskId,
        TaskStatus status,
        int progress,
        int attempts,
        String message) {
}
