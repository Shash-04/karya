package ai.taskforge.domain.enums;

/** Lifecycle status of a task as it moves through the queue. */
public enum TaskStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED;

    /** Whether the task has reached a terminal state (no further processing). */
    public boolean isTerminal() {
        return this == COMPLETED || this == FAILED;
    }
}
