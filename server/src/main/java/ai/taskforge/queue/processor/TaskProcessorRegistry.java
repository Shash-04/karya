package ai.taskforge.queue.processor;

import ai.taskforge.domain.enums.TaskType;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/** Resolves the {@link TaskProcessor} for a given {@link TaskType}. */
@Component
public class TaskProcessorRegistry {

    private final Map<TaskType, TaskProcessor> processors;

    public TaskProcessorRegistry(List<TaskProcessor> processorBeans) {
        this.processors = processorBeans.stream()
                .collect(Collectors.toMap(TaskProcessor::type, Function.identity()));
    }

    /** The processor for this type, or {@code null} if none is registered. */
    public TaskProcessor get(TaskType type) {
        return processors.get(type);
    }
}
