package ai.taskforge.bootstrap;

import ai.taskforge.domain.entity.Task;
import ai.taskforge.domain.entity.TaskLog;
import ai.taskforge.domain.entity.User;
import ai.taskforge.domain.enums.Role;
import ai.taskforge.domain.enums.TaskStatus;
import ai.taskforge.domain.enums.TaskType;
import ai.taskforge.domain.repository.TaskLogRepository;
import ai.taskforge.domain.repository.TaskRepository;
import ai.taskforge.domain.repository.UserRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds two demo accounts and sample tasks (across all statuses) on startup.
 * Idempotent — skips if the demo user already exists. Disable in production via
 * {@code taskforge.seed.enabled=false}. Seeded tasks are inserted directly with
 * their final status and are not enqueued, so they persist for the demo.
 */
@Component
@ConditionalOnProperty(name = "taskforge.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String DEMO_USER_EMAIL = "user@taskforge.ai";
    private static final String DEMO_ADMIN_EMAIL = "admin@taskforge.ai";

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final TaskLogRepository taskLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      TaskRepository taskRepository,
                      TaskLogRepository taskLogRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.taskLogRepository = taskLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail(DEMO_USER_EMAIL)) {
            log.info("Seed data already present; skipping.");
            return;
        }

        User user = createUser("Demo User", DEMO_USER_EMAIL, "UserPassword123!", Role.USER);
        createUser("Demo Admin", DEMO_ADMIN_EMAIL, "AdminPassword123!", Role.ADMIN);

        seedTask(user, "Send welcome email", TaskType.EMAIL, TaskStatus.COMPLETED,
                100, 1, "{\"ok\":true,\"messageId\":\"demo-1\"}", null, 5, null,
                "Task completed");
        seedTask(user, "Monthly revenue report", TaskType.REPORT, TaskStatus.FAILED,
                40, 3, null, "Simulated permanent failure", 8, null,
                "Task failed after 3 attempts: Simulated permanent failure");
        seedTask(user, "Export users CSV", TaskType.DATA_EXPORT, TaskStatus.PENDING,
                0, 0, null, null, 3, null, "Task created and queued");
        seedTask(user, "Resize avatar", TaskType.IMAGE_PROCESSING, TaskStatus.PROCESSING,
                50, 1, null, null, 6, null, "Processing started (attempt 1)");
        seedTask(user, "Notify partner webhook", TaskType.WEBHOOK, TaskStatus.COMPLETED,
                100, 1, "{\"ok\":true,\"httpStatus\":200}", null, 4, null,
                "Task completed");
        seedTask(user, "Nightly cleanup", TaskType.GENERIC, TaskStatus.PENDING,
                0, 0, null, null, 2, Instant.now().plus(1, ChronoUnit.HOURS),
                "Task created; scheduled");

        log.info("Seeded demo accounts ({}, {}) and sample tasks.", DEMO_USER_EMAIL, DEMO_ADMIN_EMAIL);
    }

    private User createUser(String name, String email, String rawPassword, Role role) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        return userRepository.save(user);
    }

    private void seedTask(User owner, String name, TaskType type, TaskStatus status,
                          int progress, int attempts, String result, String error,
                          int priority, Instant scheduledAt, String logMessage) {
        Task task = new Task();
        task.setUser(owner);
        task.setName(name);
        task.setType(type);
        task.setStatus(status);
        task.setProgress(progress);
        task.setAttempts(attempts);
        task.setResult(result);
        task.setErrorMessage(error);
        task.setPriority(priority);
        task.setScheduledAt(scheduledAt);
        Task saved = taskRepository.save(task);

        TaskLog logEntry = new TaskLog();
        logEntry.setTask(saved);
        logEntry.setLevel(status == TaskStatus.FAILED ? "ERROR" : "INFO");
        logEntry.setMessage(logMessage);
        taskLogRepository.save(logEntry);
    }
}
