package ai.taskforge.security;

import static org.assertj.core.api.Assertions.assertThat;

import ai.taskforge.config.JwtProperties;
import ai.taskforge.domain.entity.User;
import ai.taskforge.domain.enums.Role;
import io.jsonwebtoken.Claims;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(new JwtProperties(
                "test-secret-key-that-is-at-least-32-bytes-long!!", 900_000, 604_800_000));
    }

    @Test
    void generatesTokenAndParsesClaims() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("a@b.com");
        user.setRole(Role.ADMIN);

        String token = jwtService.generateAccessToken(user);
        Claims claims = jwtService.parseClaims(token);

        assertThat(claims.getSubject()).isEqualTo(user.getId().toString());
        assertThat(claims.get("email", String.class)).isEqualTo("a@b.com");
        assertThat(claims.get("role", String.class)).isEqualTo("ADMIN");
        assertThat(claims.getExpiration()).isAfter(claims.getIssuedAt());
    }

    @Test
    void exposesAccessExpiryInSeconds() {
        assertThat(jwtService.getAccessExpirySeconds()).isEqualTo(900);
    }
}
