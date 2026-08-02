package ai.taskforge.security;

import ai.taskforge.config.JwtProperties;
import ai.taskforge.domain.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

/**
 * Issues and verifies short-lived access tokens (signed JWT, HS256).
 * Refresh tokens are opaque and handled separately by the auth feature.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final long accessExpiryMs;

    public JwtService(JwtProperties properties) {
        this.key = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
        this.accessExpiryMs = properties.accessExpiryMs();
    }

    /** Access-token lifetime in seconds, for the {@code expiresIn} field in responses. */
    public long getAccessExpirySeconds() {
        return accessExpiryMs / 1000;
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(accessExpiryMs)))
                .signWith(key)
                .compact();
    }

    /** Parse and verify a token, returning its claims. Throws if invalid/expired. */
    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
