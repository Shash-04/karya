package ai.taskforge.queue.processor;

import ai.taskforge.domain.enums.TaskType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.Duration;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * A <em>real</em> processor: POSTs the task payload as JSON to the URL named in
 * {@code payload.url} and succeeds only on a 2xx response. Any non-2xx status,
 * connection failure, or timeout throws, so the worker's retry/backoff applies
 * exactly as it would for genuine background work.
 *
 * <p>Payload shape: <code>{"url": "https://...", ...}</code> — the whole payload
 * object is sent as the request body. The {@code fail} / {@code failUntilAttempt}
 * flags honored by the simulated processors are still respected here, so failure
 * scenarios can be exercised deterministically without a flaky endpoint.
 */
@Component
public class WebhookProcessor implements TaskProcessor {

    private static final Duration TIMEOUT = Duration.ofSeconds(5);
    private static final int MAX_SNIPPET = 500;

    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public WebhookProcessor(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) TIMEOUT.toMillis());
        factory.setReadTimeout((int) TIMEOUT.toMillis());
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    @Override
    public TaskType type() {
        return TaskType.WEBHOOK;
    }

    @Override
    public String process(TaskContext context, ProgressReporter progress) throws Exception {
        JsonNode payload = context.payload();
        applyFailureFlags(payload, context.attempts());

        String url = payload == null ? null : payload.path("url").asText(null);
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException("Webhook payload is missing a \"url\"");
        }
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            throw new IllegalArgumentException("Webhook url must be http(s): " + url);
        }

        progress.report(20, "Delivering webhook to " + url);

        // Classify status ourselves (no-op the default 4xx/5xx handler) so the
        // result/error carries the code. A connect/read timeout or refused
        // connection throws ResourceAccessException, which propagates as a failure.
        ResponseEntity<String> response = restClient.post()
                .uri(url)
                .header("Content-Type", "application/json")
                .body(payload.toString())
                .retrieve()
                .onStatus(status -> true, (req, res) -> { })
                .toEntity(String.class);

        int status = response.getStatusCode().value();
        progress.report(80, "Received HTTP " + status);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("Webhook returned non-2xx status " + status);
        }

        ObjectNode result = objectMapper.createObjectNode();
        result.put("type", type().name());
        result.put("url", url);
        result.put("httpStatus", status);
        result.put("attempts", context.attempts());
        result.put("ok", true);
        result.put("responseSnippet", snippet(response.getBody()));
        return result.toString();
    }

    /** Preserve the deterministic failure hooks used by the simulated processors. */
    private void applyFailureFlags(JsonNode payload, int attempts) {
        if (payload == null) {
            return;
        }
        if (payload.path("fail").asBoolean(false)) {
            throw new IllegalStateException("Simulated permanent failure");
        }
        int failUntil = payload.path("failUntilAttempt").asInt(0);
        if (attempts < failUntil) {
            throw new IllegalStateException("Simulated transient failure on attempt " + attempts);
        }
    }

    private String snippet(String body) {
        if (body == null) {
            return "";
        }
        return body.length() <= MAX_SNIPPET ? body : body.substring(0, MAX_SNIPPET) + "…";
    }
}
