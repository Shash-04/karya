package ai.taskforge.common.exception;

import org.springframework.http.HttpStatus;

/** 400 — the request is invalid for a reason not covered by bean validation. */
public class BadRequestException extends ApiException {

    public BadRequestException(String message) {
        super(HttpStatus.BAD_REQUEST, "BAD_REQUEST", message);
    }
}
