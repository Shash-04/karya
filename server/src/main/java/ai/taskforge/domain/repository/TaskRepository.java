package ai.taskforge.domain.repository;

import ai.taskforge.domain.entity.Task;
import ai.taskforge.domain.enums.TaskStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

/**
 * Task persistence. {@link JpaSpecificationExecutor} backs dynamic
 * search/filter/sort queries built from request parameters.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, UUID>, JpaSpecificationExecutor<Task> {

    /** Fetch a task scoped to its owner (authorization at the query level). */
    Optional<Task> findByIdAndUserId(UUID id, UUID userId);

    Page<Task> findByUserId(UUID userId, Pageable pageable);

    long countByUserId(UUID userId);

    long countByUserIdAndStatus(UUID userId, TaskStatus status);

    long countByStatus(TaskStatus status);
}
