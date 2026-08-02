package ai.taskforge.queue;

/** Redis key names for the task queue. */
public final class QueueKeys {

    /** List of task ids ready to run now (LPUSH producer, RPOP worker). */
    public static final String READY = "tf:queue:ready";

    /** Sorted set of task ids waiting to run, scored by ready-at epoch millis. */
    public static final String DELAYED = "tf:queue:delayed";

    private QueueKeys() {
    }
}
