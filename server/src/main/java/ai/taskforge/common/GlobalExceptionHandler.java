package ai.taskforge.common;

import ai.taskforge.common.exception.ApiException;
import jakarta.validation.ConstraintViolationException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/**
 * Centralized exception handling. Every error path renders the same
 * {@link ApiResponse} envelope with an appropriate HTTP status and a stable
 * error code, so clients get a consistent shape.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** Expected, client-facing errors carry their own status + code. */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Void>> handleApiException(ApiException ex) {
        return build(ex.getStatus(), ex.getMessage(), new ApiError(ex.getCode(), null));
    }

    /** @Valid body validation failures -> 400 with per-field messages. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }
        return build(HttpStatus.BAD_REQUEST, "Validation failed",
                new ApiError("VALIDATION_ERROR", fieldErrors));
    }

    /** @Validated param/path validation failures -> 400. */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(ConstraintViolationException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(),
                new ApiError("VALIDATION_ERROR", null));
    }

    /** Upload exceeded the configured size limit. */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxUpload(MaxUploadSizeExceededException ex) {
        return build(HttpStatus.BAD_REQUEST, "Uploaded file is too large",
                new ApiError("FILE_TOO_LARGE", null));
    }

    /** Authenticated but not permitted -> 403. */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return build(HttpStatus.FORBIDDEN, "Access denied",
                new ApiError("FORBIDDEN", null));
    }

    /** Authentication failure -> 401. */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthentication(AuthenticationException ex) {
        return build(HttpStatus.UNAUTHORIZED, "Authentication required",
                new ApiError("UNAUTHORIZED", null));
    }

    /** Anything unexpected -> 500, logged with a stack trace (not leaked to client). */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception ex) {
        log.error("Unhandled exception", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong",
                new ApiError("INTERNAL_ERROR", null));
    }

    private ResponseEntity<ApiResponse<Void>> build(HttpStatus status, String message, ApiError error) {
        return ResponseEntity.status(status).body(ApiResponse.error(message, error));
    }
}
