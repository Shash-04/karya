package ai.taskforge.domain.repository;

import ai.taskforge.domain.entity.TaskLog;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskLogRepository extends JpaRepository<TaskLog, Long> {

    List<TaskLog> findByTaskIdOrderByCreatedAtAsc(UUID taskId);
}
