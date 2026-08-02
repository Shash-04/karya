package ai.taskforge.queue.processor;

import ai.taskforge.domain.enums.TaskType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class WebhookProcessor extends AbstractSimulatedProcessor {

    public WebhookProcessor(ObjectMapper objectMapper) {
        super(objectMapper);
    }

    @Override
    public TaskType type() {
        return TaskType.WEBHOOK;
    }

    @Override
    protected String action() {
        return "Delivering webhook";
    }
}
