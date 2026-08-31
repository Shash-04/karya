package ai.taskforge.feature.system.dto;

import java.util.List;

/**
 * Read-only view of the deployment's effective configuration. Deliberately
 * excludes secrets (JWT signing key, datasource/Redis passwords) — only
 * operationally-relevant, non-sensitive values are surfaced.
 */
public record SystemConfigResponse(
        Worker worker,
        Queue queue,
        RateLimit rateLimit,
        Jwt jwt,
        Storage storage,
        List<String> activeProfiles,
        List<String> corsAllowedOrigins) {

    /** Worker thread-pool sizing (from {@code AsyncConfig}). */
    public record Worker(int corePoolSize, int maxPoolSize, int queueCapacity) {
    }

    /** Queue behaviour. Retry uses a fixed delay (not exponential). */
    public record Queue(int maxAttempts, long retryDelayMs, long pollIntervalMs) {
    }

    /** Fixed-window rate limits (requests per window). */
    public record RateLimit(
            int authLimit,
            long authWindowSeconds,
            int taskCreateLimit,
            long taskCreateWindowSeconds) {
    }

    /** Token lifetimes only — never the signing secret. */
    public record Jwt(long accessExpiryMs, long refreshExpiryMs) {
    }

    public record Storage(String maxFileSize, String uploadPath) {
    }
}
