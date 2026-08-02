package ai.taskforge.common;

import java.time.Instant;

/**
 * Centralized response envelope wrapping every API result, per the API standard:
 *
 * <pre>
 * { "success": true, "message": "...", "data": {...}, "error": null, "timestamp": "..." }
 * </pre>
 *
 * @param <T> the type of the {@code data} payload
 */
public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        ApiError error,
        Instant timestamp) {

    private static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, null, Instant.now());
    }

    /** 200-style success with data and a message. */
    public static <T> ApiResponse<T> ok(String message, T data) {
        return success(message, data);
    }

    /** Success with data and a default message. */
    public static <T> ApiResponse<T> ok(T data) {
        return success("OK", data);
    }

    /** Success carrying only a message (no body payload). */
    public static ApiResponse<Void> ok(String message) {
        return success(message, null);
    }

    /** Failure envelope; pair with the appropriate HTTP status on the ResponseEntity. */
    public static <T> ApiResponse<T> error(String message, ApiError error) {
        return new ApiResponse<>(false, message, null, error, Instant.now());
    }
}
