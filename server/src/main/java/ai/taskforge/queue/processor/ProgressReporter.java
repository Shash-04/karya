package ai.taskforge.queue.processor;

/** Callback a processor uses to report incremental progress (0-100). */
@FunctionalInterface
public interface ProgressReporter {
    void report(int percent, String message);
}
