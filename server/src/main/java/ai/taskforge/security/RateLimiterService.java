package ai.taskforge.security;

import java.time.Duration;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/**
 * Fixed-window rate limiter backed by Redis. The first request in a window sets
 * the key's TTL; the window rolls over naturally as the epoch bucket advances.
 */
@Service
public class RateLimiterService {

    private final StringRedisTemplate redis;

    public RateLimiterService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    /**
     * @return true if the request is within the limit, false if it should be throttled
     */
    public boolean allow(String bucket, String identifier, int limit, long windowSeconds) {
        long window = System.currentTimeMillis() / (windowSeconds * 1000);
        String key = "tf:rl:" + bucket + ":" + identifier + ":" + window;
        Long count = redis.opsForValue().increment(key);
        if (count != null && count == 1L) {
            redis.expire(key, Duration.ofSeconds(windowSeconds));
        }
        return count == null || count <= limit;
    }
}
