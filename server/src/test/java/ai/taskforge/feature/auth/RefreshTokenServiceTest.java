package ai.taskforge.feature.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ai.taskforge.common.exception.UnauthorizedException;
import ai.taskforge.config.JwtProperties;
import ai.taskforge.domain.entity.RefreshToken;
import ai.taskforge.domain.entity.User;
import ai.taskforge.domain.repository.RefreshTokenRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private RefreshTokenService service;

    @BeforeEach
    void setUp() {
        service = new RefreshTokenService(refreshTokenRepository,
                new JwtProperties("test-secret-key-that-is-at-least-32-bytes-long!!", 900_000, 604_800_000));
    }

    @Test
    void issueStoresHashNotRawTokenAndReturnsRaw() {
        User user = new User();
        user.setId(UUID.randomUUID());
        when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        String raw = service.issue(user);

        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(captor.capture());
        RefreshToken saved = captor.getValue();
        assertThat(raw).isNotBlank();
        assertThat(saved.getTokenHash()).isNotEqualTo(raw);
        assertThat(saved.getUser()).isSameAs(user);
        assertThat(saved.getExpiresAt()).isAfter(Instant.now());
    }

    @Test
    void verifyReturnsActiveToken() {
        RefreshToken token = new RefreshToken();
        token.setExpiresAt(Instant.now().plusSeconds(60));
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        assertThat(service.verify("raw")).isSameAs(token);
    }

    @Test
    void verifyThrowsWhenTokenUnknown() {
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.verify("raw")).isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void verifyThrowsWhenExpired() {
        RefreshToken token = new RefreshToken();
        token.setExpiresAt(Instant.now().minusSeconds(60));
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));
        assertThatThrownBy(() -> service.verify("raw")).isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void verifyThrowsWhenRevoked() {
        RefreshToken token = new RefreshToken();
        token.setExpiresAt(Instant.now().plusSeconds(60));
        token.setRevokedAt(Instant.now());
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));
        assertThatThrownBy(() -> service.verify("raw")).isInstanceOf(UnauthorizedException.class);
    }
}
