package ai.taskforge.websocket;

import ai.taskforge.queue.TaskUpdatedEvent;
import java.time.Instant;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Broadcasts task updates to the owning user over WebSocket. Fires after the
 * database transaction commits so the client never sees an update ahead of the
 * persisted state; {@code fallbackExecution} covers any non-transactional path.
 */
@Component
public class TaskUpdateBroadcaster {

    private static final String USER_DESTINATION = "/queue/tasks";

    private final SimpMessagingTemplate messagingTemplate;

    public TaskUpdateBroadcaster(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onTaskUpdated(TaskUpdatedEvent event) {
        TaskUpdateMessage message = new TaskUpdateMessage(
                event.taskId(), event.status(), event.progress(),
                event.attempts(), event.message(), Instant.now());
        messagingTemplate.convertAndSendToUser(
                event.userId().toString(), USER_DESTINATION, message);
    }
}
