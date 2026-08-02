package ai.taskforge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * TaskForge application entry point.
 *
 * <p>A task automation and job processing platform: users create tasks, tasks are
 * pushed onto a Redis queue, an async worker processes them, and status updates are
 * streamed live to the frontend over WebSocket.
 *
 * <p>{@code @EnableAsync} powers the in-process queue worker (dedicated thread pool);
 * {@code @EnableScheduling} drives the queue poller and scheduled-task dispatch.
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class TaskForgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaskForgeApplication.class, args);
    }
}
