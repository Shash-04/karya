package ai.taskforge.feature.task;

import ai.taskforge.common.exception.ResourceNotFoundException;
import ai.taskforge.domain.entity.Attachment;
import ai.taskforge.domain.entity.Task;
import ai.taskforge.domain.repository.AttachmentRepository;
import ai.taskforge.domain.repository.TaskRepository;
import ai.taskforge.feature.task.dto.AttachmentResponse;
import ai.taskforge.storage.FileStorageService;
import ai.taskforge.storage.StoredFile;
import java.util.List;
import java.util.UUID;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/** Handles image/PDF attachments for a task (owner-scoped). */
@Service
public class AttachmentService {

    private final TaskRepository taskRepository;
    private final AttachmentRepository attachmentRepository;
    private final FileStorageService fileStorageService;

    public AttachmentService(TaskRepository taskRepository,
                             AttachmentRepository attachmentRepository,
                             FileStorageService fileStorageService) {
        this.taskRepository = taskRepository;
        this.attachmentRepository = attachmentRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public AttachmentResponse upload(UUID userId, UUID taskId, MultipartFile file) {
        Task task = requireOwned(userId, taskId);
        StoredFile stored = fileStorageService.store(file, taskId);

        Attachment attachment = new Attachment();
        attachment.setTask(task);
        attachment.setOriginalFilename(stored.originalFilename());
        attachment.setStoredPath(stored.storedPath());
        attachment.setContentType(stored.contentType());
        attachment.setSizeBytes(stored.size());
        return AttachmentResponse.from(attachmentRepository.saveAndFlush(attachment));
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> list(UUID userId, UUID taskId) {
        requireOwned(userId, taskId);
        return attachmentRepository.findByTaskId(taskId).stream()
                .map(AttachmentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public DownloadableFile download(UUID userId, UUID taskId, UUID attachmentId) {
        requireOwned(userId, taskId);
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .filter(a -> a.getTask().getId().equals(taskId))
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
        Resource resource = fileStorageService.loadAsResource(attachment.getStoredPath());
        return new DownloadableFile(resource, attachment.getContentType(), attachment.getOriginalFilename());
    }

    private Task requireOwned(UUID userId, UUID taskId) {
        return taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    /** A resource ready to stream back to the client. */
    public record DownloadableFile(Resource resource, String contentType, String filename) {
    }
}
