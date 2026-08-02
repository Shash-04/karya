package ai.taskforge.websocket;

import ai.taskforge.domain.enums.TaskStatus;
import java.time.Instant;
import java.util.UUID;

/** Payload delivered to the client over {@code /user/queue/tasks}. */
public record TaskUpdateMessage(
        UUID taskId,
        TaskStatus status,
        int progress,
        int attempts,
        String message,
        Instant timestamp) {
}
