package ai.taskforge.bootstrap;

import ai.taskforge.domain.entity.Task;
import ai.taskforge.domain.entity.User;
import ai.taskforge.domain.enums.Role;
import ai.taskforge.domain.enums.TaskStatus;
import ai.taskforge.domain.enums.TaskType;
import ai.taskforge.domain.repository.TaskRepository;
import ai.taskforge.domain.repository.UserRepository;
import ai.taskforge.queue.QueueProducer;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Seeds two demo accounts and a spread of <em>real</em> sample tasks on startup.
 * Idempotent — skips if the demo user already exists. Disable in production via
 * {@code taskforge.seed.enabled=false}.
 *
 * <p>Unlike a static fixture, seeded tasks are created as {@code PENDING} and
 * pushed onto the queue, so they actually run through the worker pipeline. Their
 * payloads drive genuine outcomes — a permanent failure that exhausts its retries,
 * a flaky job that fails once then recovers, plain successes, and a scheduled job —
 * all with live progress, real attempt counts, and streamed WebSocket updates.
 * Enqueueing is deferred until after the seeding transaction commits so the poller
 * never races ahead of the rows it is about to read.
 */
@Component
@ConditionalOnProperty(name = "taskforge.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String DEMO_USER_EMAIL = "user@taskforge.ai";
    private static final String DEMO_ADMIN_EMAIL = "admin@taskforge.ai";

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final QueueProducer queueProducer;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      TaskRepository taskRepository,
                      QueueProducer queueProducer,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.queueProducer = queueProducer;
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

        List<Enqueue> plan = new ArrayList<>();

        // A plain success — completes on the first attempt.
        plan.add(seedTask(user, "Send welcome email", TaskType.EMAIL, 5, null, null, 0));

        // A real permanent failure: throws every attempt, so it exhausts its retry
        // budget with genuine backoff and ends FAILED — not a hardcoded status.
        plan.add(seedTask(user, "Monthly revenue report", TaskType.REPORT, 8,
                "{\"fail\":true}", null, 1_000));

        // A flaky job that fails its first attempt, then succeeds on retry.
        plan.add(seedTask(user, "Export users CSV", TaskType.DATA_EXPORT, 3,
                "{\"failUntilAttempt\":2}", null, 3_000));

        // Another success, staggered so progress bars advance at different times.
        plan.add(seedTask(user, "Resize avatar", TaskType.IMAGE_PROCESSING, 6, null, null, 4_000));

        plan.add(seedTask(user, "Notify partner webhook", TaskType.WEBHOOK, 4, null, null, 2_000));

        // A genuinely scheduled job: sits in the delayed set until it is due.
        Instant runAt = Instant.now().plus(1, ChronoUnit.HOURS);
        plan.add(seedTask(user, "Nightly cleanup", TaskType.GENERIC, 2, null, runAt, 0));

        enqueueAfterCommit(plan);
        log.info("Seeded demo accounts ({}, {}) and {} live sample tasks.",
                DEMO_USER_EMAIL, DEMO_ADMIN_EMAIL, plan.size());
    }

    private User createUser(String name, String email, String rawPassword, Role role) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        return userRepository.save(user);
    }

    /**
     * Persist a PENDING task and return how it should be enqueued once the
     * transaction commits. {@code scheduledAt} (if set) wins over {@code delayMs};
     * otherwise {@code delayMs} just staggers immediate work so the demo feels live.
     */
    private Enqueue seedTask(User owner, String name, TaskType type, int priority,
                             String payload, Instant scheduledAt, long delayMs) {
        Task task = new Task();
        task.setUser(owner);
        task.setName(name);
        task.setType(type);
        task.setStatus(TaskStatus.PENDING);
        task.setProgress(0);
        task.setAttempts(0);
        task.setPriority(priority);
        task.setPayload(payload);
        task.setScheduledAt(scheduledAt);
        Task saved = taskRepository.save(task);

        long resolvedDelay = delayMs;
        if (scheduledAt != null) {
            resolvedDelay = Math.max(0, Duration.between(Instant.now(), scheduledAt).toMillis());
        }
        return new Enqueue(saved.getId(), resolvedDelay);
    }

    /** Push to Redis only after the DB commit, so the poller can't outrun the rows. */
    private void enqueueAfterCommit(List<Enqueue> plan) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                for (Enqueue e : plan) {
                    if (e.delayMs() > 0) {
                        queueProducer.enqueueDelayed(e.taskId(), e.delayMs());
                    } else {
                        queueProducer.enqueue(e.taskId());
                    }
                }
            }
        });
    }

    private record Enqueue(UUID taskId, long delayMs) {
    }
}
