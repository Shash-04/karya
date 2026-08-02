package ai.taskforge.common.exception;

import org.springframework.http.HttpStatus;

/** 409 — the request conflicts with the resource's current state
 * (e.g. updating a task that is already processing). */
public class ConflictException extends ApiException {

    public ConflictException(String message) {
        super(HttpStatus.CONFLICT, "CONFLICT", message);
    }
}
