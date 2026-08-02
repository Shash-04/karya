package ai.taskforge.queue;

import java.util.UUID;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

/**
 * Enqueues tasks onto Redis. Immediate work goes to the {@link QueueKeys#READY}
 * list; scheduled/retry work goes to the {@link QueueKeys#DELAYED} sorted set,
 * from which the poller promotes due entries.
 */
@Component
public class QueueProducer {

    private final StringRedisTemplate redis;

    public QueueProducer(StringRedisTemplate redis) {
        this.redis = redis;
    }

    /** Make a task available to run immediately. */
    public void enqueue(UUID taskId) {
        redis.opsForList().leftPush(QueueKeys.READY, taskId.toString());
    }

    /** Make a task available to run after {@code delayMs}. */
    public void enqueueDelayed(UUID taskId, long delayMs) {
        double readyAt = System.currentTimeMillis() + Math.max(0, delayMs);
        redis.opsForZSet().add(QueueKeys.DELAYED, taskId.toString(), readyAt);
    }

    public long readyCount() {
        Long size = redis.opsForList().size(QueueKeys.READY);
        return size == null ? 0 : size;
    }

    public long delayedCount() {
        Long size = redis.opsForZSet().size(QueueKeys.DELAYED);
        return size == null ? 0 : size;
    }
}
