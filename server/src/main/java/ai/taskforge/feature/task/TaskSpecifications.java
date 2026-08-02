package ai.taskforge.feature.task;

import ai.taskforge.domain.entity.Task;
import ai.taskforge.domain.enums.TaskStatus;
import ai.taskforge.domain.enums.TaskType;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

/** Composable JPA specifications for task search/filtering. */
public final class TaskSpecifications {

    private TaskSpecifications() {
    }

    /** Restrict to a single owner (always applied for user-facing queries). */
    public static Specification<Task> ownedBy(UUID userId) {
        return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
    }

    public static Specification<Task> hasStatus(TaskStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Task> hasType(TaskType type) {
        return (root, query, cb) -> cb.equal(root.get("type"), type);
    }

    /** Case-insensitive match on name or description. */
    public static Specification<Task> matches(String search) {
        String like = "%" + search.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), like),
                cb.like(cb.lower(root.get("description")), like));
    }
}
