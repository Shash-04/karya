package ai.taskforge.websocket;

import ai.taskforge.domain.enums.Role;
import ai.taskforge.security.JwtService;
import io.jsonwebtoken.Claims;
import java.util.List;
import java.util.UUID;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

/**
 * Authenticates the STOMP CONNECT frame using the {@code Authorization: Bearer}
 * header. The resulting principal's name is the user id, so the broker routes
 * {@code /user/**} destinations to the correct user.
 */
@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;

    public StompAuthChannelInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || !StompCommand.CONNECT.equals(accessor.getCommand())) {
            return message;
        }

        String header = accessor.getFirstNativeHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing bearer token on WebSocket connect");
        }
        try {
            Claims claims = jwtService.parseClaims(header.substring(7));
            UUID userId = UUID.fromString(claims.getSubject());
            Role role = Role.valueOf(claims.get("role", String.class));
            var authentication = new UsernamePasswordAuthenticationToken(
                    userId.toString(), null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role.name())));
            accessor.setUser(authentication);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid token on WebSocket connect", ex);
        }
        return message;
    }
}
