package ai.taskforge.common.exception;

import org.springframework.http.HttpStatus;

/** 404 — a requested resource does not exist (or is not visible to the caller). */
public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, "NOT_FOUND", message);
    }
}
