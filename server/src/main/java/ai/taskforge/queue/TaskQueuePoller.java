package ai.taskforge.queue;

import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Drives the queue on a fixed interval: promote any due entries from the delayed
 * set into the ready list, then drain the ready list onto the worker pool.
 */
@Component
public class TaskQueuePoller {

    private static final Logger log = LoggerFactory.getLogger(TaskQueuePoller.class);
    private static final int MAX_DRAIN_PER_TICK = 200;

    private final StringRedisTemplate redis;
    private final TaskWorker worker;

    public TaskQueuePoller(StringRedisTemplate redis, TaskWorker worker) {
        this.redis = redis;
        this.worker = worker;
    }

    @Scheduled(fixedDelay = 1000)
    public void poll() {
        promoteDue();
        drainReady();
    }

    /** Move tasks whose ready-at time has passed from the delayed set to ready. */
    private void promoteDue() {
        long now = System.currentTimeMillis();
        Set<String> due = redis.opsForZSet().rangeByScore(QueueKeys.DELAYED, 0, now);
        if (due == null) {
            return;
        }
        for (String taskId : due) {
            // Only the mover that actually removes the member re-queues it.
            Long removed = redis.opsForZSet().remove(QueueKeys.DELAYED, taskId);
            if (removed != null && removed > 0) {
                redis.opsForList().leftPush(QueueKeys.READY, taskId);
            }
        }
    }

    /** Hand ready task ids to the worker pool, bounded per tick. */
    private void drainReady() {
        for (int i = 0; i < MAX_DRAIN_PER_TICK; i++) {
            String taskId = redis.opsForList().rightPop(QueueKeys.READY);
            if (taskId == null) {
                return;
            }
            try {
                worker.process(UUID.fromString(taskId));
            } catch (IllegalArgumentException badId) {
                log.warn("Discarding malformed task id from queue: {}", taskId);
            }
        }
    }
}
