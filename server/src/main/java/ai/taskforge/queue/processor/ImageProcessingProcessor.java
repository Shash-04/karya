package ai.taskforge.queue.processor;

import ai.taskforge.domain.enums.TaskType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class ImageProcessingProcessor extends AbstractSimulatedProcessor {

    public ImageProcessingProcessor(ObjectMapper objectMapper) {
        super(objectMapper);
    }

    @Override
    public TaskType type() {
        return TaskType.IMAGE_PROCESSING;
    }

    @Override
    protected String action() {
        return "Processing image";
    }
}
