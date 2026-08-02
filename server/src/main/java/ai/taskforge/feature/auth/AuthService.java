package ai.taskforge.feature.auth;

import ai.taskforge.common.exception.ConflictException;
import ai.taskforge.common.exception.UnauthorizedException;
import ai.taskforge.domain.entity.RefreshToken;
import ai.taskforge.domain.entity.User;
import ai.taskforge.domain.enums.Role;
import ai.taskforge.domain.repository.UserRepository;
import ai.taskforge.feature.auth.dto.AuthResponse;
import ai.taskforge.feature.auth.dto.LoginRequest;
import ai.taskforge.feature.auth.dto.RegisterRequest;
import ai.taskforge.feature.auth.dto.UserResponse;
import ai.taskforge.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Orchestrates registration, login, token refresh, and logout. */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email is already registered");
        }
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);
        // saveAndFlush so @CreationTimestamp/@UpdateTimestamp are populated
        // before we build the response body.
        User saved = userRepository.saveAndFlush(user);
        return issueTokens(saved);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Throws AuthenticationException (-> 401) on bad credentials.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken current = refreshTokenService.verify(rawRefreshToken);
        User user = current.getUser();
        // Rotate: revoke the presented token, issue a fresh pair.
        refreshTokenService.revoke(current);
        return issueTokens(user);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        refreshTokenService.revokeRaw(rawRefreshToken);
    }

    @Transactional(readOnly = true)
    public UserResponse me(java.util.UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User no longer exists"));
        return UserResponse.from(user);
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.issue(user);
        return AuthResponse.of(accessToken, refreshToken,
                jwtService.getAccessExpirySeconds(), UserResponse.from(user));
    }
}
