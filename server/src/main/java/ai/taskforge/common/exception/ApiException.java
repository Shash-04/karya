package ai.taskforge.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Base type for expected, client-facing errors. Carries the HTTP status and a
 * stable error code so the global handler can render a consistent response.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    public ApiException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }
}
