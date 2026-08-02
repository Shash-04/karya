package ai.taskforge.queue;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import ai.taskforge.config.QueueProperties;
import ai.taskforge.domain.entity.Task;
import ai.taskforge.domain.entity.User;
import ai.taskforge.domain.enums.TaskStatus;
import ai.taskforge.domain.enums.TaskType;
import ai.taskforge.domain.repository.TaskLogRepository;
import ai.taskforge.domain.repository.TaskRepository;
import ai.taskforge.queue.processor.TaskContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

@ExtendWith(MockitoExtension.class)
class TaskExecutionServiceTest {

    @Mock
    private TaskRepository taskRepository;
    @Mock
    private TaskLogRepository taskLogRepository;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    private TaskExecutionService service;

    @BeforeEach
    void setUp() {
        service = new TaskExecutionService(taskRepository, taskLogRepository,
                new QueueProperties(3, 5000), new ObjectMapper(), eventPublisher);
    }

    @Test
    void beginMarksProcessingAndIncrementsAttempts() {
        Task task = task(TaskStatus.PENDING, 0);
        when(taskRepository.findById(task.getId())).thenReturn(Optional.of(task));

        Optional<TaskContext> context = service.begin(task.getId());

        assertThat(context).isPresent();
        assertThat(context.get().attempts()).isEqualTo(1);
        assertThat(task.getStatus()).isEqualTo(TaskStatus.PROCESSING);
        assertThat(task.getAttempts()).isEqualTo(1);
    }

    @Test
    void beginSkipsAlreadyCompletedTask() {
        Task task = task(TaskStatus.COMPLETED, 1);
        when(taskRepository.findById(task.getId())).thenReturn(Optional.of(task));

        assertThat(service.begin(task.getId())).isEmpty();
    }

    @Test
    void failRetriesWhenUnderAttemptLimit() {
        Task task = task(TaskStatus.PROCESSING, 1);
        when(taskRepository.findById(task.getId())).thenReturn(Optional.of(task));

        boolean willRetry = service.fail(task.getId(), "boom");

        assertThat(willRetry).isTrue();
        assertThat(task.getStatus()).isEqualTo(TaskStatus.PENDING);
        assertThat(task.getErrorMessage()).isEqualTo("boom");
    }

    @Test
    void failMarksFailedAtAttemptLimit() {
        Task task = task(TaskStatus.PROCESSING, 3);
        when(taskRepository.findById(task.getId())).thenReturn(Optional.of(task));

        boolean willRetry = service.fail(task.getId(), "boom");

        assertThat(willRetry).isFalse();
        assertThat(task.getStatus()).isEqualTo(TaskStatus.FAILED);
    }

    @Test
    void completeSetsResultAndFullProgress() {
        Task task = task(TaskStatus.PROCESSING, 1);
        when(taskRepository.findById(task.getId())).thenReturn(Optional.of(task));

        service.complete(task.getId(), "{\"ok\":true}");

        assertThat(task.getStatus()).isEqualTo(TaskStatus.COMPLETED);
        assertThat(task.getProgress()).isEqualTo(100);
        assertThat(task.getResult()).isEqualTo("{\"ok\":true}");
    }

    private Task task(TaskStatus status, int attempts) {
        Task task = new Task();
        task.setId(UUID.randomUUID());
        User owner = new User();
        owner.setId(UUID.randomUUID());
        task.setUser(owner);
        task.setType(TaskType.GENERIC);
        task.setStatus(status);
        task.setAttempts(attempts);
        return task;
    }
}
