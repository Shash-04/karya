package ai.taskforge.queue.processor;

import ai.taskforge.domain.enums.TaskType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class EmailProcessor extends AbstractSimulatedProcessor {

    public EmailProcessor(ObjectMapper objectMapper) {
        super(objectMapper);
    }

    @Override
    public TaskType type() {
        return TaskType.EMAIL;
    }

    @Override
    protected String action() {
        return "Sending email";
    }
}
