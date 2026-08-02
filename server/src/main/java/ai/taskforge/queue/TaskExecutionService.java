package ai.taskforge.queue;

import ai.taskforge.config.QueueProperties;
import ai.taskforge.domain.entity.Task;
import ai.taskforge.domain.entity.TaskLog;
import ai.taskforge.domain.enums.TaskStatus;
import ai.taskforge.domain.repository.TaskLogRepository;
import ai.taskforge.domain.repository.TaskRepository;
import ai.taskforge.queue.processor.TaskContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The transactional boundary around task execution. Each method is a short,
 * self-contained transaction so no DB connection is held while the processor
 * does its (potentially slow) work.
 */
@Service
public class TaskExecutionService {

    private final TaskRepository taskRepository;
    private final TaskLogRepository taskLogRepository;
    private final QueueProperties queueProperties;
    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher eventPublisher;

    public TaskExecutionService(TaskRepository taskRepository,
                                TaskLogRepository taskLogRepository,
                                QueueProperties queueProperties,
                                ObjectMapper objectMapper,
                                ApplicationEventPublisher eventPublisher) {
        this.taskRepository = taskRepository;
        this.taskLogRepository = taskLogRepository;
        this.queueProperties = queueProperties;
        this.objectMapper = objectMapper;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Transition a task to PROCESSING and return its snapshot, or empty if the
     * task is gone or must not run (already completed or in-flight).
     */
    @Transactional
    public Optional<TaskContext> begin(UUID taskId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null || task.getStatus() == TaskStatus.COMPLETED
                || task.getStatus() == TaskStatus.PROCESSING) {
            return Optional.empty();
        }
        task.setStatus(TaskStatus.PROCESSING);
        task.setAttempts(task.getAttempts() + 1);
        task.setProgress(0);
        task.setErrorMessage(null);
        taskRepository.save(task);
        String startMessage = "Processing started (attempt " + task.getAttempts() + ")";
        writeLog(task, "INFO", startMessage);
        publishUpdate(task, startMessage);
        return Optional.of(new TaskContext(task.getId(), task.getType(),
                parse(task.getPayload()), task.getAttempts()));
    }

    @Transactional
    public void updateProgress(UUID taskId, int percent, String message) {
        taskRepository.findById(taskId).ifPresent(task -> {
            task.setProgress(percent);
            taskRepository.save(task);
            writeLog(task, "INFO", message);
            publishUpdate(task, message);
        });
    }

    @Transactional
    public void complete(UUID taskId, String resultJson) {
        taskRepository.findById(taskId).ifPresent(task -> {
            task.setStatus(TaskStatus.COMPLETED);
            task.setProgress(100);
            task.setResult(resultJson);
            taskRepository.save(task);
            writeLog(task, "INFO", "Task completed");
            publishUpdate(task, "Task completed");
        });
    }

    /**
     * Record a failed attempt. Returns {@code true} if the task will be retried
     * (still under the attempt limit), {@code false} if it is now FAILED.
     */
    @Transactional
    public boolean fail(UUID taskId, String error) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            return false;
        }
        boolean willRetry = task.getAttempts() < queueProperties.maxAttempts();
        task.setErrorMessage(error);
        String message;
        if (willRetry) {
            task.setStatus(TaskStatus.PENDING);
            message = "Attempt " + task.getAttempts() + " failed: " + error + " — will retry";
            writeLog(task, "WARN", message);
        } else {
            task.setStatus(TaskStatus.FAILED);
            message = "Task failed after " + task.getAttempts() + " attempts: " + error;
            writeLog(task, "ERROR", message);
        }
        taskRepository.save(task);
        publishUpdate(task, message);
        return willRetry;
    }

    private JsonNode parse(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readTree(raw);
        } catch (Exception e) {
            return null;
        }
    }

    private void publishUpdate(Task task, String message) {
        eventPublisher.publishEvent(new TaskUpdatedEvent(
                task.getUser().getId(), task.getId(), task.getStatus(),
                task.getProgress(), task.getAttempts(), message));
    }

    private void writeLog(Task task, String level, String message) {
        TaskLog log = new TaskLog();
        log.setTask(task);
        log.setLevel(level);
        log.setMessage(message);
        taskLogRepository.save(log);
    }
}
