package ai.taskforge.queue.processor;

import ai.taskforge.domain.enums.TaskType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class ReportProcessor extends AbstractSimulatedProcessor {

    public ReportProcessor(ObjectMapper objectMapper) {
        super(objectMapper);
    }

    @Override
    public TaskType type() {
        return TaskType.REPORT;
    }

    @Override
    protected String action() {
        return "Generating report";
    }
}
