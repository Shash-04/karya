package ai.taskforge.feature.admin.dto;

/**
 * Platform-wide queue and task metrics.
 *
 * @param readyDepth   task ids currently in the Redis ready list
 * @param delayedDepth task ids currently in the Redis delayed set
 */
public record QueueMetricsResponse(
        long readyDepth,
        long delayedDepth,
        long pending,
        long processing,
        long completed,
        long failed,
        long totalTasks) {
}
