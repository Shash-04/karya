package ai.taskforge.feature.task.dto;

/**
 * Dashboard counts for the current user plus live queue depth.
 *
 * @param queued    task ids currently waiting in the ready queue (Redis)
 * @param scheduled task ids waiting in the delayed set (Redis)
 */
public record TaskStatsResponse(
        long total,
        long pending,
        long processing,
        long completed,
        long failed,
        long queued,
        long scheduled) {
}
