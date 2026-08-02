package ai.taskforge.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * JWT settings bound from {@code taskforge.jwt.*}.
 *
 * @param secret          HMAC signing secret (must be >= 32 bytes for HS256)
 * @param accessExpiryMs  access-token lifetime in milliseconds
 * @param refreshExpiryMs refresh-token lifetime in milliseconds
 */
@ConfigurationProperties(prefix = "taskforge.jwt")
public record JwtProperties(String secret, long accessExpiryMs, long refreshExpiryMs) {
}
