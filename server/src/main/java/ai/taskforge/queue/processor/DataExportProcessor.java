package ai.taskforge.queue.processor;

import ai.taskforge.domain.enums.TaskType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class DataExportProcessor extends AbstractSimulatedProcessor {

    public DataExportProcessor(ObjectMapper objectMapper) {
        super(objectMapper);
    }

    @Override
    public TaskType type() {
        return TaskType.DATA_EXPORT;
    }

    @Override
    protected String action() {
        return "Exporting data";
    }
}
