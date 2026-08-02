package ai.taskforge.common.exception;

import org.springframework.http.HttpStatus;

/** 401 — authentication failed (bad credentials, invalid/expired token). */
public class UnauthorizedException extends ApiException {

    public UnauthorizedException(String message) {
        super(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", message);
    }
}
