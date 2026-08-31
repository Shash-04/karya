package ai.taskforge.feature.system.dto;

/**
 * Live runtime telemetry: real worker-pool, queue, task, Redis, JVM and
 * database-pool figures introspected at request time. Fields that could not be
 * read (e.g. Redis unreachable) are reported as {@code available=false} / null
 * rather than fabricated.
 */
public record SystemTelemetryResponse(
        WorkerPool workerPool,
        QueueDepth queue,
        Tasks tasks,
        Redis redis,
        Jvm jvm,
        Database database) {

    /** Live figures from the {@code taskWorkerExecutor} thread pool. */
    public record WorkerPool(
            int corePoolSize,
            int maxPoolSize,
            int queueCapacity,
            int activeCount,
            int poolSize,
            int queuedTasks,
            long completedTasks) {
    }

    /** Redis queue depth. */
    public record QueueDepth(long readyDepth, long delayedDepth) {
    }

    /** Global task counts by status (platform-wide). */
    public record Tasks(long pending, long processing, long completed, long failed, long total) {
    }

    /** Selected fields from Redis {@code INFO}; {@code available=false} if unreachable. */
    public record Redis(
            boolean available,
            String version,
            Long usedMemoryBytes,
            String usedMemoryHuman,
            Integer connectedClients,
            Long opsPerSec,
            String maxMemoryPolicy,
            Boolean aofEnabled) {

        public static Redis unavailable() {
            return new Redis(false, null, null, null, null, null, null, null);
        }
    }

    /** JVM heap and process figures. */
    public record Jvm(
            long heapUsedBytes,
            long heapMaxBytes,
            double cpuUsagePercent,
            long uptimeMs,
            int availableProcessors) {
    }

    /** Datasource connection-pool figures; {@code available=false} if the pool can't be read. */
    public record Database(
            boolean available,
            Integer activeConnections,
            Integer idleConnections,
            Integer totalConnections,
            Integer maxPoolSize) {

        public static Database unavailable() {
            return new Database(false, null, null, null, null);
        }
    }
}
