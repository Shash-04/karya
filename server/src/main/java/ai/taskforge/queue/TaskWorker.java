package ai.taskforge.queue;

import ai.taskforge.config.QueueProperties;
import ai.taskforge.queue.processor.TaskContext;
import ai.taskforge.queue.processor.TaskProcessor;
import ai.taskforge.queue.processor.TaskProcessorRegistry;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Consumes a single task on the worker thread pool: mark PROCESSING, run the
 * type's processor (reporting progress), then complete or fail-with-retry.
 * Runs outside any DB transaction; persistence is delegated to
 * {@link TaskExecutionService} in short transactions.
 */
@Component
public class TaskWorker {

    private static final Logger log = LoggerFactory.getLogger(TaskWorker.class);

    private final TaskExecutionService executionService;
    private final TaskProcessorRegistry registry;
    private final QueueProducer queueProducer;
    private final QueueProperties queueProperties;

    public TaskWorker(TaskExecutionService executionService,
                      TaskProcessorRegistry registry,
                      QueueProducer queueProducer,
                      QueueProperties queueProperties) {
        this.executionService = executionService;
        this.registry = registry;
        this.queueProducer = queueProducer;
        this.queueProperties = queueProperties;
    }

    @Async("taskWorkerExecutor")
    public void process(UUID taskId) {
        Optional<TaskContext> maybeContext = executionService.begin(taskId);
        if (maybeContext.isEmpty()) {
            return; // task deleted, already done, or already in-flight
        }
        TaskContext context = maybeContext.get();

        TaskProcessor processor = registry.get(context.type());
        if (processor == null) {
            executionService.fail(taskId, "No processor registered for type " + context.type());
            return;
        }

        try {
            String result = processor.process(context,
                    (percent, message) -> executionService.updateProgress(taskId, percent, message));
            executionService.complete(taskId, result);
        } catch (Exception ex) {
            String reason = ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName();
            log.debug("Task {} attempt {} failed: {}", taskId, context.attempts(), reason);
            boolean willRetry = executionService.fail(taskId, reason);
            if (willRetry) {
                queueProducer.enqueueDelayed(taskId, queueProperties.retryDelayMs());
            }
        }
    }
}
