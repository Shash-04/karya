package ai.taskforge.common;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Structured error payload carried inside {@link ApiResponse#error()}.
 *
 * @param code    a stable, machine-readable error code (e.g. VALIDATION_ERROR)
 * @param details optional extra context, e.g. a map of field -> message for
 *                validation failures; omitted from JSON when null
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(String code, Object details) {

    public static ApiError of(String code) {
        return new ApiError(code, null);
    }
}
