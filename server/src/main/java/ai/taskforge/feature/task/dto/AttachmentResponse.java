package ai.taskforge.feature.task.dto;

import ai.taskforge.domain.entity.Attachment;
import java.time.Instant;
import java.util.UUID;

public record AttachmentResponse(
        UUID id,
        String originalFilename,
        String contentType,
        long sizeBytes,
        Instant createdAt) {

    public static AttachmentResponse from(Attachment attachment) {
        return new AttachmentResponse(
                attachment.getId(),
                attachment.getOriginalFilename(),
                attachment.getContentType(),
                attachment.getSizeBytes(),
                attachment.getCreatedAt());
    }
}
