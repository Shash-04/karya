package ai.taskforge.domain.repository;

import ai.taskforge.domain.entity.Attachment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {

    List<Attachment> findByTaskId(UUID taskId);
}
