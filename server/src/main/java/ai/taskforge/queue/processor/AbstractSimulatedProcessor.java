package ai.taskforge.queue.processor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * Base for the (simulated) task processors. Real background work would replace
 * the sleeps with actual I/O. Two payload flags make behavior deterministic for
 * testing:
 * <ul>
 *   <li>{@code "fail": true} — always throw, exercising the retry/FAILED path.</li>
 *   <li>{@code "failUntilAttempt": N} — throw while the attempt number is &lt; N,
 *       then succeed (exercising retry-then-success).</li>
 * </ul>
 */
public abstract class AbstractSimulatedProcessor implements TaskProcessor {

    private static final int[] STEPS = {25, 50, 75};
    private static final long STEP_DELAY_MS = 200;

    private final ObjectMapper objectMapper;

    protected AbstractSimulatedProcessor(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /** Human-readable action verb used in progress messages. */
    protected abstract String action();

    @Override
    public String process(TaskContext context, ProgressReporter progress) throws Exception {
        JsonNode payload = context.payload();
        if (payload != null && payload.path("fail").asBoolean(false)) {
            throw new IllegalStateException("Simulated permanent failure");
        }
        int failUntil = payload == null ? 0 : payload.path("failUntilAttempt").asInt(0);
        if (context.attempts() < failUntil) {
            throw new IllegalStateException("Simulated transient failure on attempt " + context.attempts());
        }

        for (int step : STEPS) {
            Thread.sleep(STEP_DELAY_MS);
            progress.report(step, action() + " " + step + "%");
        }

        ObjectNode result = objectMapper.createObjectNode();
        result.put("type", type().name());
        result.put("action", action());
        result.put("attempts", context.attempts());
        result.put("ok", true);
        return result.toString();
    }
}
