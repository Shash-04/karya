package ai.taskforge.feature.task;

import ai.taskforge.common.PageResponse;
import ai.taskforge.common.exception.ConflictException;
import ai.taskforge.common.exception.ResourceNotFoundException;
import ai.taskforge.domain.entity.Task;
import ai.taskforge.domain.entity.TaskLog;
import ai.taskforge.domain.enums.TaskStatus;
import ai.taskforge.domain.enums.TaskType;
import ai.taskforge.domain.repository.TaskLogRepository;
import ai.taskforge.domain.repository.TaskRepository;
import ai.taskforge.domain.repository.UserRepository;
import ai.taskforge.feature.task.dto.CreateTaskRequest;
import ai.taskforge.feature.task.dto.TaskDetailResponse;
import ai.taskforge.feature.task.dto.TaskResponse;
import ai.taskforge.feature.task.dto.TaskStatsResponse;
import ai.taskforge.feature.task.dto.UpdateTaskRequest;
import ai.taskforge.queue.QueueProducer;
import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Task lifecycle: create/queue, query, update-while-pending, delete, retry, stats. */
@Service
public class TaskService {

    private static final Set<String> ALLOWED_SORT =
            Set.of("createdAt", "updatedAt", "priority", "status", "name");

    private final TaskRepository taskRepository;
    private final TaskLogRepository taskLogRepository;
    private final UserRepository userRepository;
    private final QueueProducer queueProducer;
    private final TaskMapper taskMapper;

    public TaskService(TaskRepository taskRepository,
                       TaskLogRepository taskLogRepository,
                       UserRepository userRepository,
                       QueueProducer queueProducer,
                       TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.taskLogRepository = taskLogRepository;
        this.userRepository = userRepository;
        this.queueProducer = queueProducer;
        this.taskMapper = taskMapper;
    }

    @Transactional
    public TaskResponse create(UUID userId, CreateTaskRequest request) {
        Task task = new Task();
        task.setUser(userRepository.getReferenceById(userId));
        task.setName(request.name());
        task.setDescription(request.description());
        task.setType(request.type());
        task.setPriority(request.priority() == null ? 0 : request.priority());
        task.setPayload(taskMapper.writeJson(request.payload()));
        task.setScheduledAt(request.scheduledAt());
        task.setStatus(TaskStatus.PENDING);
        Task saved = taskRepository.saveAndFlush(task);

        Instant now = Instant.now();
        if (saved.getScheduledAt() != null && saved.getScheduledAt().isAfter(now)) {
            long delayMs = Duration.between(now, saved.getScheduledAt()).toMillis();
            queueProducer.enqueueDelayed(saved.getId(), delayMs);
            writeLog(saved, "INFO", "Task created; scheduled for " + saved.getScheduledAt());
        } else {
            queueProducer.enqueue(saved.getId());
            writeLog(saved, "INFO", "Task created and queued");
        }
        return taskMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskResponse> list(UUID userId, String search, TaskStatus status,
                                           TaskType type, int page, int size, String sortBy, String order) {
        Specification<Task> spec = TaskSpecifications.ownedBy(userId);
        if (search != null && !search.isBlank()) {
            spec = spec.and(TaskSpecifications.matches(search));
        }
        if (status != null) {
            spec = spec.and(TaskSpecifications.hasStatus(status));
        }
        if (type != null) {
            spec = spec.and(TaskSpecifications.hasType(type));
        }

        String sortProp = ALLOWED_SORT.contains(sortBy) ? sortBy : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(Math.max(page, 0), clampSize(size), Sort.by(direction, sortProp));

        return PageResponse.from(taskRepository.findAll(spec, pageable).map(taskMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public TaskDetailResponse getDetail(UUID userId, UUID taskId) {
        Task task = requireOwned(userId, taskId);
        return taskMapper.toDetail(task, taskLogRepository.findByTaskIdOrderByCreatedAtAsc(taskId));
    }

    @Transactional
    public TaskResponse update(UUID userId, UUID taskId, UpdateTaskRequest request) {
        Task task = requireOwned(userId, taskId);
        if (task.getStatus() != TaskStatus.PENDING) {
            throw new ConflictException("Task can only be updated while it is pending");
        }
        if (request.name() != null) {
            task.setName(request.name());
        }
        if (request.description() != null) {
            task.setDescription(request.description());
        }
        if (request.priority() != null) {
            task.setPriority(request.priority());
        }
        if (request.payload() != null) {
            task.setPayload(taskMapper.writeJson(request.payload()));
        }
        writeLog(task, "INFO", "Task updated");
        return taskMapper.toResponse(task);
    }

    @Transactional
    public void delete(UUID userId, UUID taskId) {
        Task task = requireOwned(userId, taskId);
        taskRepository.delete(task);
    }

    @Transactional
    public TaskResponse retry(UUID userId, UUID taskId) {
        Task task = requireOwned(userId, taskId);
        if (task.getStatus() != TaskStatus.FAILED) {
            throw new ConflictException("Only failed tasks can be retried");
        }
        task.setStatus(TaskStatus.PENDING);
        task.setErrorMessage(null);
        task.setProgress(0);
        task.setAttempts(0);
        taskRepository.saveAndFlush(task);
        queueProducer.enqueue(task.getId());
        writeLog(task, "INFO", "Task retry requested; re-queued");
        return taskMapper.toResponse(task);
    }

    @Transactional(readOnly = true)
    public TaskStatsResponse stats(UUID userId) {
        return new TaskStatsResponse(
                taskRepository.countByUserId(userId),
                taskRepository.countByUserIdAndStatus(userId, TaskStatus.PENDING),
                taskRepository.countByUserIdAndStatus(userId, TaskStatus.PROCESSING),
                taskRepository.countByUserIdAndStatus(userId, TaskStatus.COMPLETED),
                taskRepository.countByUserIdAndStatus(userId, TaskStatus.FAILED),
                queueProducer.readyCount(),
                queueProducer.delayedCount());
    }

    private Task requireOwned(UUID userId, UUID taskId) {
        return taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    private void writeLog(Task task, String level, String message) {
        TaskLog log = new TaskLog();
        log.setTask(task);
        log.setLevel(level);
        log.setMessage(message);
        taskLogRepository.save(log);
    }

    private int clampSize(int size) {
        if (size < 1) {
            return 20;
        }
        return Math.min(size, 100);
    }
}
