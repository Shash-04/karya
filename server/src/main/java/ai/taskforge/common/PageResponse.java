package ai.taskforge.common;

import java.util.List;
import org.springframework.data.domain.Page;

/**
 * Stable pagination envelope (avoids serializing Spring's {@code PageImpl}
 * directly, whose JSON shape is discouraged in Boot 3).
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last) {

    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast());
    }
}
