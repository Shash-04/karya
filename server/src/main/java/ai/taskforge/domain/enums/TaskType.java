package ai.taskforge.domain.enums;

/**
 * Kind of background work a task represents. In this project the processors are
 * simulated/lightweight stand-ins for real work; each type maps to a processor.
 */
public enum TaskType {
    EMAIL,
    REPORT,
    DATA_EXPORT,
    IMAGE_PROCESSING,
    WEBHOOK,
    GENERIC
}
