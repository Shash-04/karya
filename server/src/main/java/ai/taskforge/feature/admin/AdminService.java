package ai.taskforge.feature.admin;

import ai.taskforge.common.PageResponse;
import ai.taskforge.domain.entity.Task;
import ai.taskforge.domain.enums.TaskStatus;
import ai.taskforge.domain.enums.TaskType;
import ai.taskforge.domain.repository.TaskRepository;
import ai.taskforge.domain.repository.UserRepository;
import ai.taskforge.feature.admin.dto.QueueMetricsResponse;
import ai.taskforge.feature.admin.dto.UserSummaryResponse;
import ai.taskforge.feature.task.TaskMapper;
import ai.taskforge.feature.task.TaskSpecifications;
import ai.taskforge.feature.task.dto.TaskResponse;
import ai.taskforge.queue.QueueProducer;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Admin-only read views spanning all users. */
@Service
public class AdminService {

    private static final Set<String> ALLOWED_SORT =
            Set.of("createdAt", "updatedAt", "priority", "status", "name");

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final QueueProducer queueProducer;
    private final TaskMapper taskMapper;

    public AdminService(TaskRepository taskRepository,
                        UserRepository userRepository,
                        QueueProducer queueProducer,
                        TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.queueProducer = queueProducer;
        this.taskMapper = taskMapper;
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskResponse> listAllTasks(String search, TaskStatus status, TaskType type,
                                                   int page, int size, String sortBy, String order) {
        Specification<Task> spec = Specification.where(null);
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
    public PageResponse<UserSummaryResponse> listUsers(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), clampSize(size),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(userRepository.findAll(pageable).map(user ->
                new UserSummaryResponse(
                        user.getId(), user.getName(), user.getEmail(), user.getRole(),
                        user.getCreatedAt(), taskRepository.countByUserId(user.getId()))));
    }

    @Transactional(readOnly = true)
    public QueueMetricsResponse queueMetrics() {
        return new QueueMetricsResponse(
                queueProducer.readyCount(),
                queueProducer.delayedCount(),
                taskRepository.countByStatus(TaskStatus.PENDING),
                taskRepository.countByStatus(TaskStatus.PROCESSING),
                taskRepository.countByStatus(TaskStatus.COMPLETED),
                taskRepository.countByStatus(TaskStatus.FAILED),
                taskRepository.count());
    }

    private int clampSize(int size) {
        if (size < 1) {
            return 20;
        }
        return Math.min(size, 100);
    }
}
