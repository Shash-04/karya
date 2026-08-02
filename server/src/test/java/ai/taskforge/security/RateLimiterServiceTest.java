package ai.taskforge.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

@ExtendWith(MockitoExtension.class)
class RateLimiterServiceTest {

    @Mock
    private StringRedisTemplate redis;
    @Mock
    private ValueOperations<String, String> valueOps;

    @Test
    void allowsWhenUnderLimit() {
        when(redis.opsForValue()).thenReturn(valueOps);
        when(valueOps.increment(anyString())).thenReturn(3L);

        RateLimiterService service = new RateLimiterService(redis);
        assertThat(service.allow("auth", "1.2.3.4", 5, 60)).isTrue();
    }

    @Test
    void blocksWhenOverLimit() {
        when(redis.opsForValue()).thenReturn(valueOps);
        when(valueOps.increment(anyString())).thenReturn(6L);

        RateLimiterService service = new RateLimiterService(redis);
        assertThat(service.allow("auth", "1.2.3.4", 5, 60)).isFalse();
    }
}
