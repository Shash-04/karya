package ai.taskforge.security;

import ai.taskforge.common.ApiError;
import ai.taskforge.common.ApiResponse;
import ai.taskforge.config.RateLimitProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Throttles auth attempts (keyed by client IP) and task creation (keyed by user)
 * using {@link RateLimiterService}. Returns 429 with a {@code Retry-After} header
 * in the standard response envelope when a limit is exceeded.
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimiterService rateLimiterService;
    private final RateLimitProperties properties;
    private final ObjectMapper objectMapper;

    public RateLimitInterceptor(RateLimiterService rateLimiterService,
                                RateLimitProperties properties,
                                ObjectMapper objectMapper) {
        this.rateLimiterService = rateLimiterService;
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String uri = request.getRequestURI();
        String method = request.getMethod();

        boolean allowed;
        long windowSeconds;
        if (uri.endsWith("/api/v1/tasks") && "POST".equalsIgnoreCase(method)) {
            windowSeconds = properties.taskCreateWindowSeconds();
            allowed = rateLimiterService.allow("task-create", currentUserId(request),
                    properties.taskCreateLimit(), windowSeconds);
        } else if (uri.endsWith("/auth/login") || uri.endsWith("/auth/register")) {
            windowSeconds = properties.authWindowSeconds();
            allowed = rateLimiterService.allow("auth", clientIp(request),
                    properties.authLimit(), windowSeconds);
        } else {
            return true;
        }

        if (allowed) {
            return true;
        }
        writeTooManyRequests(response, windowSeconds);
        return false;
    }

    private String currentUserId(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return "user:" + principal.getId();
        }
        return "ip:" + clientIp(request);
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void writeTooManyRequests(HttpServletResponse response, long retryAfterSeconds)
            throws Exception {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSeconds));
        objectMapper.writeValue(response.getWriter(),
                ApiResponse.error("Too many requests, please slow down", ApiError.of("RATE_LIMITED")));
    }
}
