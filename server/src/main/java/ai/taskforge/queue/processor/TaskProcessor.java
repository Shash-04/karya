package ai.taskforge.queue.processor;

import ai.taskforge.domain.enums.TaskType;

/** Runs one kind of task. Implementations are registered by {@link #type()}. */
public interface TaskProcessor {

    TaskType type();

    /**
     * Execute the task.
     *
     * @param context  the task snapshot (payload, attempt number)
     * @param progress callback to report progress as the work proceeds
     * @return a JSON string stored as the task result
     * @throws Exception on failure; the worker decides whether to retry
     */
    String process(TaskContext context, ProgressReporter progress) throws Exception;
}
