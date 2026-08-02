package ai.taskforge.feature.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ai.taskforge.common.exception.ConflictException;
import ai.taskforge.domain.entity.User;
import ai.taskforge.feature.auth.dto.AuthResponse;
import ai.taskforge.feature.auth.dto.LoginRequest;
import ai.taskforge.feature.auth.dto.RegisterRequest;
import ai.taskforge.security.JwtService;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private ai.taskforge.domain.repository.UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;
    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerCreatesUserAndIssuesTokens() {
        RegisterRequest request = new RegisterRequest("Jane", "jane@taskforge.ai", "password123");
        when(userRepository.existsByEmail("jane@taskforge.ai")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.saveAndFlush(any())).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });
        when(jwtService.generateAccessToken(any())).thenReturn("access-token");
        when(jwtService.getAccessExpirySeconds()).thenReturn(900L);
        when(refreshTokenService.issue(any())).thenReturn("refresh-token");

        AuthResponse response = authService.register(request);

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");
        assertThat(response.user().email()).isEqualTo("jane@taskforge.ai");
    }

    @Test
    void registerRejectsDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("Jane", "jane@taskforge.ai", "password123");
        when(userRepository.existsByEmail("jane@taskforge.ai")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request)).isInstanceOf(ConflictException.class);
        verify(userRepository, never()).saveAndFlush(any());
    }

    @Test
    void loginAuthenticatesAndIssuesTokens() {
        LoginRequest request = new LoginRequest("jane@taskforge.ai", "password123");
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("jane@taskforge.ai");
        when(userRepository.findByEmail("jane@taskforge.ai")).thenReturn(Optional.of(user));
        when(jwtService.generateAccessToken(user)).thenReturn("access-token");
        when(jwtService.getAccessExpirySeconds()).thenReturn(900L);
        when(refreshTokenService.issue(user)).thenReturn("refresh-token");

        AuthResponse response = authService.login(request);

        verify(authenticationManager).authenticate(any());
        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");
    }
}
