package ai.taskforge.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Queue behavior bound from {@code taskforge.queue.*}.
 *
 * @param maxAttempts  max processing attempts before a task is marked FAILED
 * @param retryDelayMs delay before a failed attempt is retried
 */
@ConfigurationProperties(prefix = "taskforge.queue")
public record QueueProperties(int maxAttempts, long retryDelayMs) {
}
