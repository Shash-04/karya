package ai.taskforge.feature.system;

import ai.taskforge.config.JwtProperties;
import ai.taskforge.config.QueueProperties;
import ai.taskforge.config.RateLimitProperties;
import ai.taskforge.config.StorageProperties;
import ai.taskforge.domain.enums.TaskStatus;
import ai.taskforge.domain.repository.TaskRepository;
import ai.taskforge.feature.system.dto.SystemConfigResponse;
import ai.taskforge.feature.system.dto.SystemTelemetryResponse;
import ai.taskforge.queue.QueueProducer;
import com.zaxxer.hikari.HikariDataSource;
import java.lang.management.ManagementFactory;
import java.sql.Connection;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.ThreadPoolExecutor;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Assembles the read-only System Config view and the live runtime telemetry
 * that back the frontend's Config and Telemetry pages. Everything here is real,
 * introspected state — no fabricated figures. External reads (Redis INFO, DB
 * pool) fail soft: on error the corresponding block is marked unavailable.
 */
@Service
public class SystemService {

    private static final Logger log = LoggerFactory.getLogger(SystemService.class);

    private final ThreadPoolTaskExecutor workerExecutor;
    private final QueueProducer queueProducer;
    private final TaskRepository taskRepository;
    private final StringRedisTemplate redis;
    private final DataSource dataSource;
    private final QueueProperties queueProperties;
    private final RateLimitProperties rateLimitProperties;
    private final JwtProperties jwtProperties;
    private final StorageProperties storageProperties;
    private final Environment environment;
    private final long pollIntervalMs;
    private final List<String> corsAllowedOrigins;

    public SystemService(
            @Qualifier("taskWorkerExecutor") ThreadPoolTaskExecutor workerExecutor,
            QueueProducer queueProducer,
            TaskRepository taskRepository,
            StringRedisTemplate redis,
            DataSource dataSource,
            QueueProperties queueProperties,
            RateLimitProperties rateLimitProperties,
            JwtProperties jwtProperties,
            StorageProperties storageProperties,
            Environment environment,
            @Value("${taskforge.queue.poll-interval-ms:30000}") long pollIntervalMs,
            @Value("${taskforge.cors.allowed-origins}") List<String> corsAllowedOrigins) {
        this.workerExecutor = workerExecutor;
        this.queueProducer = queueProducer;
        this.taskRepository = taskRepository;
        this.redis = redis;
        this.dataSource = dataSource;
        this.queueProperties = queueProperties;
        this.rateLimitProperties = rateLimitProperties;
        this.jwtProperties = jwtProperties;
        this.storageProperties = storageProperties;
        this.environment = environment;
        this.pollIntervalMs = pollIntervalMs;
        this.corsAllowedOrigins = corsAllowedOrigins;
    }

    /** Effective, non-sensitive configuration. */
    public SystemConfigResponse config() {
        ThreadPoolExecutor tpe = workerExecutor.getThreadPoolExecutor();
        int queueCapacity = tpe.getQueue().size() + tpe.getQueue().remainingCapacity();

        return new SystemConfigResponse(
                new SystemConfigResponse.Worker(
                        workerExecutor.getCorePoolSize(),
                        workerExecutor.getMaxPoolSize(),
                        queueCapacity),
                new SystemConfigResponse.Queue(
                        queueProperties.maxAttempts(),
                        queueProperties.retryDelayMs(),
                        pollIntervalMs),
                new SystemConfigResponse.RateLimit(
                        rateLimitProperties.authLimit(),
                        rateLimitProperties.authWindowSeconds(),
                        rateLimitProperties.taskCreateLimit(),
                        rateLimitProperties.taskCreateWindowSeconds()),
                new SystemConfigResponse.Jwt(
                        jwtProperties.accessExpiryMs(),
                        jwtProperties.refreshExpiryMs()),
                new SystemConfigResponse.Storage(
                        storageProperties.maxFileSize(),
                        storageProperties.uploadPath()),
                List.of(environment.getActiveProfiles()),
                corsAllowedOrigins);
    }

    /** Live runtime telemetry. Read-only tx covers the task count queries. */
    @Transactional(readOnly = true)
    public SystemTelemetryResponse telemetry() {
        return new SystemTelemetryResponse(
                workerPool(),
                new SystemTelemetryResponse.QueueDepth(
                        queueProducer.readyCount(), queueProducer.delayedCount()),
                tasks(),
                redisInfo(),
                jvm(),
                database());
    }

    private SystemTelemetryResponse.WorkerPool workerPool() {
        ThreadPoolExecutor tpe = workerExecutor.getThreadPoolExecutor();
        int queueCapacity = tpe.getQueue().size() + tpe.getQueue().remainingCapacity();
        return new SystemTelemetryResponse.WorkerPool(
                workerExecutor.getCorePoolSize(),
                workerExecutor.getMaxPoolSize(),
                queueCapacity,
                tpe.getActiveCount(),
                tpe.getPoolSize(),
                tpe.getQueue().size(),
                tpe.getCompletedTaskCount());
    }

    private SystemTelemetryResponse.Tasks tasks() {
        return new SystemTelemetryResponse.Tasks(
                taskRepository.countByStatus(TaskStatus.PENDING),
                taskRepository.countByStatus(TaskStatus.PROCESSING),
                taskRepository.countByStatus(TaskStatus.COMPLETED),
                taskRepository.countByStatus(TaskStatus.FAILED),
                taskRepository.count());
    }

    private SystemTelemetryResponse.Redis redisInfo() {
        RedisConnectionFactory factory = redis.getConnectionFactory();
        if (factory == null) {
            return SystemTelemetryResponse.Redis.unavailable();
        }
        try (RedisConnection connection = factory.getConnection()) {
            Properties info = connection.serverCommands().info();
            if (info == null) {
                return SystemTelemetryResponse.Redis.unavailable();
            }
            return new SystemTelemetryResponse.Redis(
                    true,
                    info.getProperty("redis_version"),
                    parseLong(info.getProperty("used_memory")),
                    info.getProperty("used_memory_human"),
                    parseInt(info.getProperty("connected_clients")),
                    parseLong(info.getProperty("instantaneous_ops_per_sec")),
                    info.getProperty("maxmemory_policy"),
                    "1".equals(info.getProperty("aof_enabled")));
        } catch (Exception e) {
            log.warn("Redis INFO unavailable for telemetry: {}", e.getMessage());
            return SystemTelemetryResponse.Redis.unavailable();
        }
    }

    private SystemTelemetryResponse.Jvm jvm() {
        var heap = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage();
        long uptime = ManagementFactory.getRuntimeMXBean().getUptime();
        return new SystemTelemetryResponse.Jvm(
                heap.getUsed(),
                heap.getMax(),
                processCpuPercent(),
                uptime,
                Runtime.getRuntime().availableProcessors());
    }

    /** Process CPU load as a percentage, or 0 if the platform doesn't expose it. */
    private double processCpuPercent() {
        try {
            var os = ManagementFactory.getOperatingSystemMXBean();
            if (os instanceof com.sun.management.OperatingSystemMXBean sunOs) {
                double load = sunOs.getProcessCpuLoad();
                return load < 0 ? 0.0 : Math.round(load * 1000.0) / 10.0;
            }
        } catch (Exception e) {
            log.debug("Process CPU load unavailable: {}", e.getMessage());
        }
        return 0.0;
    }

    private SystemTelemetryResponse.Database database() {
        try {
            if (dataSource instanceof HikariDataSource hikari) {
                var pool = hikari.getHikariPoolMXBean();
                if (pool != null) {
                    return new SystemTelemetryResponse.Database(
                            true,
                            pool.getActiveConnections(),
                            pool.getIdleConnections(),
                            pool.getTotalConnections(),
                            hikari.getMaximumPoolSize());
                }
            }
            // Non-Hikari or pool not yet initialised: validate a connection to report up/down.
            try (Connection c = dataSource.getConnection()) {
                return new SystemTelemetryResponse.Database(c.isValid(1), null, null, null, null);
            }
        } catch (Exception e) {
            log.warn("Database pool unavailable for telemetry: {}", e.getMessage());
            return SystemTelemetryResponse.Database.unavailable();
        }
    }

    private static Long parseLong(String v) {
        try {
            return v == null ? null : Long.parseLong(v.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static Integer parseInt(String v) {
        try {
            return v == null ? null : Integer.parseInt(v.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
