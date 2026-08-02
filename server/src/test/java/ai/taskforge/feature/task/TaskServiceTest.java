package ai.taskforge.feature.task;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ai.taskforge.common.exception.ConflictException;
import ai.taskforge.domain.entity.Task;
import ai.taskforge.domain.entity.User;
import ai.taskforge.domain.enums.TaskStatus;
import ai.taskforge.domain.enums.TaskType;
import ai.taskforge.domain.repository.TaskLogRepository;
import ai.taskforge.domain.repository.TaskRepository;
import ai.taskforge.domain.repository.UserRepository;
import ai.taskforge.feature.task.dto.CreateTaskRequest;
import ai.taskforge.feature.task.dto.UpdateTaskRequest;
import ai.taskforge.queue.QueueProducer;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;
    @Mock
    private TaskLogRepository taskLogRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private QueueProducer queueProducer;
    @Mock
    private TaskMapper taskMapper;

    @InjectMocks
    private TaskService taskService;

    private final UUID userId = UUID.randomUUID();
    private final UUID taskId = UUID.randomUUID();

    @Test
    void createEnqueuesImmediatelyWhenNotScheduled() {
        when(userRepository.getReferenceById(userId)).thenReturn(new User());
        when(taskRepository.saveAndFlush(any())).thenAnswer(inv -> {
            Task t = inv.getArgument(0);
            t.setId(taskId);
            return t;
        });

        taskService.create(userId, new CreateTaskRequest("job", null, TaskType.EMAIL, null, null, null));

        ArgumentCaptor<Task> captor = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository).saveAndFlush(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(TaskStatus.PENDING);
        verify(queueProducer).enqueue(any(UUID.class));
        verify(queueProducer, never()).enqueueDelayed(any(), anyLong());
    }

    @Test
    void createEnqueuesDelayedWhenScheduledInFuture() {
        when(userRepository.getReferenceById(userId)).thenReturn(new User());
        when(taskRepository.saveAndFlush(any())).thenAnswer(inv -> {
            Task t = inv.getArgument(0);
            t.setId(taskId);
            return t;
        });
        Instant future = Instant.now().plus(1, ChronoUnit.HOURS);

        taskService.create(userId, new CreateTaskRequest("job", null, TaskType.GENERIC, null, null, future));

        verify(queueProducer).enqueueDelayed(any(UUID.class), anyLong());
        verify(queueProducer, never()).enqueue(any());
    }

    @Test
    void updateRejectedWhenNotPending() {
        when(taskRepository.findByIdAndUserId(taskId, userId)).thenReturn(Optional.of(taskWith(TaskStatus.PROCESSING)));
        assertThatThrownBy(() ->
                taskService.update(userId, taskId, new UpdateTaskRequest("x", null, null, null)))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void retryRejectedWhenNotFailed() {
        when(taskRepository.findByIdAndUserId(taskId, userId)).thenReturn(Optional.of(taskWith(TaskStatus.COMPLETED)));
        assertThatThrownBy(() -> taskService.retry(userId, taskId)).isInstanceOf(ConflictException.class);
    }

    @Test
    void retryResetsFailedTaskAndReEnqueues() {
        Task failed = taskWith(TaskStatus.FAILED);
        failed.setAttempts(3);
        failed.setErrorMessage("boom");
        when(taskRepository.findByIdAndUserId(taskId, userId)).thenReturn(Optional.of(failed));
        when(taskRepository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));

        taskService.retry(userId, taskId);

        assertThat(failed.getStatus()).isEqualTo(TaskStatus.PENDING);
        assertThat(failed.getAttempts()).isZero();
        assertThat(failed.getErrorMessage()).isNull();
        verify(queueProducer).enqueue(failed.getId());
    }

    private Task taskWith(TaskStatus status) {
        Task task = new Task();
        task.setId(taskId);
        User owner = new User();
        owner.setId(userId);
        task.setUser(owner);
        task.setStatus(status);
        return task;
    }
}
