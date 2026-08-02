package ai.taskforge.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Rate-limit settings bound from {@code taskforge.ratelimit.*}. Limits are
 * requests permitted per fixed window.
 */
@ConfigurationProperties(prefix = "taskforge.ratelimit")
public record RateLimitProperties(
        int authLimit,
        long authWindowSeconds,
        int taskCreateLimit,
        long taskCreateWindowSeconds) {
}
