package ai.taskforge.feature.admin.dto;

import ai.taskforge.domain.enums.Role;
import java.time.Instant;
import java.util.UUID;

public record UserSummaryResponse(
        UUID id,
        String name,
        String email,
        Role role,
        Instant createdAt,
        long totalTasks) {
}
