package ai.taskforge.queue.processor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import ai.taskforge.domain.enums.TaskType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Exercises the real HTTP behavior of {@link WebhookProcessor} against a local
 * in-process server (no network), covering the 2xx-success and non-2xx-failure
 * paths as well as payload validation and the deterministic failure hooks.
 */
class WebhookProcessorTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final WebhookProcessor processor = new WebhookProcessor(objectMapper);
    private final ProgressReporter noop = (percent, message) -> { };

    private HttpServer server;
    private String baseUrl;

    @BeforeEach
    void startServer() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.start();
        baseUrl = "http://127.0.0.1:" + server.getAddress().getPort();
    }

    @AfterEach
    void stopServer() {
        server.stop(0);
    }

    private TaskContext context(String payloadJson, int attempts) throws Exception {
        JsonNode payload = payloadJson == null ? null : objectMapper.readTree(payloadJson);
        return new TaskContext(UUID.randomUUID(), TaskType.WEBHOOK, payload, attempts);
    }

    @Test
    void postsPayloadAndSucceedsOn2xx() throws Exception {
        AtomicReference<String> receivedBody = new AtomicReference<>();
        server.createContext("/hook", exchange -> {
            receivedBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            byte[] body = "{\"received\":true}".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });

        String result = processor.process(
                context("{\"url\":\"" + baseUrl + "/hook\",\"event\":\"ping\"}", 1), noop);

        JsonNode parsed = objectMapper.readTree(result);
        assertThat(parsed.get("ok").asBoolean()).isTrue();
        assertThat(parsed.get("httpStatus").asInt()).isEqualTo(200);
        // The full payload (including the url) is delivered as the request body.
        assertThat(objectMapper.readTree(receivedBody.get()).get("event").asText()).isEqualTo("ping");
    }

    @Test
    void failsOnNon2xx() {
        server.createContext("/hook", exchange -> {
            exchange.sendResponseHeaders(500, -1);
            exchange.close();
        });

        assertThatThrownBy(() ->
                processor.process(context("{\"url\":\"" + baseUrl + "/hook\"}", 1), noop))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("500");
    }

    @Test
    void rejectsMissingUrl() {
        assertThatThrownBy(() -> processor.process(context("{\"event\":\"x\"}", 1), noop))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("url");
    }

    @Test
    void honorsPermanentFailureFlag() {
        assertThatThrownBy(() ->
                processor.process(context("{\"url\":\"" + baseUrl + "/hook\",\"fail\":true}", 1), noop))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("permanent failure");
    }

    @Test
    void reportsWebhookType() {
        assertThat(processor.type()).isEqualTo(TaskType.WEBHOOK);
    }
}
