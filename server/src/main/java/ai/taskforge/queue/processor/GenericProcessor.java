package ai.taskforge.queue.processor;

import ai.taskforge.domain.enums.TaskType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class GenericProcessor extends AbstractSimulatedProcessor {

    public GenericProcessor(ObjectMapper objectMapper) {
        super(objectMapper);
    }

    @Override
    public TaskType type() {
        return TaskType.GENERIC;
    }

    @Override
    protected String action() {
        return "Running job";
    }
}
