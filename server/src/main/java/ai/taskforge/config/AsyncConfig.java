package ai.taskforge.config;

import java.util.concurrent.ThreadPoolExecutor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/** Thread pool that runs the queue worker, isolated from the web request threads. */
@Configuration
public class AsyncConfig {

    @Bean("taskWorkerExecutor")
    public ThreadPoolTaskExecutor taskWorkerExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("task-worker-");
        // Backpressure: if the pool is saturated, the poller thread runs the task
        // itself rather than dropping it.
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
