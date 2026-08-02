package ai.taskforge.feature.auth;

import ai.taskforge.common.exception.UnauthorizedException;
import ai.taskforge.config.JwtProperties;
import ai.taskforge.domain.entity.RefreshToken;
import ai.taskforge.domain.entity.User;
import ai.taskforge.domain.repository.RefreshTokenRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Manages opaque refresh tokens. The raw token is returned to the client once;
 * only its SHA-256 hash is persisted. Tokens are rotated on use (the old one is
 * revoked and a new one issued), limiting the blast radius of a leaked token.
 */
@Service
public class RefreshTokenService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();

    private final RefreshTokenRepository refreshTokenRepository;
    private final long refreshExpiryMs;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, JwtProperties jwtProperties) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshExpiryMs = jwtProperties.refreshExpiryMs();
    }

    /** Issue a new refresh token for the user; returns the raw token (shown once). */
    @Transactional
    public String issue(User user) {
        String raw = generateRawToken();
        RefreshToken entity = new RefreshToken();
        entity.setUser(user);
        entity.setTokenHash(hash(raw));
        entity.setExpiresAt(Instant.now().plusMillis(refreshExpiryMs));
        refreshTokenRepository.save(entity);
        return raw;
    }

    /** Resolve and validate a raw refresh token, or throw 401 if invalid/expired/revoked. */
    @Transactional(readOnly = true)
    public RefreshToken verify(String rawToken) {
        RefreshToken token = refreshTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
        if (!token.isActive(Instant.now())) {
            throw new UnauthorizedException("Refresh token expired or revoked");
        }
        return token;
    }

    /** Revoke a token (idempotent). */
    @Transactional
    public void revoke(RefreshToken token) {
        if (token.getRevokedAt() == null) {
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
        }
    }

    /** Revoke by raw token if it exists; silently ignores unknown tokens. */
    @Transactional
    public void revokeRaw(String rawToken) {
        refreshTokenRepository.findByTokenHash(hash(rawToken)).ifPresent(this::revoke);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return URL_ENCODER.encodeToString(bytes);
    }

    private String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
