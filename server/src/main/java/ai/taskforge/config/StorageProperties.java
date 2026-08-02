package ai.taskforge.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * File-storage settings bound from {@code taskforge.storage.*}.
 *
 * @param uploadPath  base directory for stored uploads
 * @param maxFileSize configured per-file limit (informational; the servlet
 *                    multipart config enforces it)
 */
@ConfigurationProperties(prefix = "taskforge.storage")
public record StorageProperties(String uploadPath, String maxFileSize) {
}
