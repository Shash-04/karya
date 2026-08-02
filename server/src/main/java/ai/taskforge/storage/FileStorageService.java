package ai.taskforge.storage;

import ai.taskforge.common.exception.BadRequestException;
import ai.taskforge.common.exception.ResourceNotFoundException;
import ai.taskforge.config.StorageProperties;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 * Stores uploaded files on the local filesystem under a per-task folder, with
 * content-type validation and path-traversal guards. Only images and PDFs are
 * accepted; the DB records a path relative to the storage root.
 */
@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/png", "image/jpeg", "image/gif", "image/webp", "application/pdf");

    private final Path root;

    public FileStorageService(StorageProperties properties) {
        this.root = Paths.get(properties.uploadPath()).toAbsolutePath().normalize();
    }

    public StoredFile store(MultipartFile file, UUID taskId) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException("Unsupported file type: " + contentType
                    + ". Allowed types: PNG, JPEG, GIF, WEBP, PDF");
        }

        try {
            Path directory = root.resolve(taskId.toString());
            Files.createDirectories(directory);

            String original = StringUtils.cleanPath(
                    Objects.requireNonNullElse(file.getOriginalFilename(), "file"));
            String storedName = UUID.randomUUID() + extensionOf(original);
            Path target = directory.resolve(storedName).normalize();
            if (!target.startsWith(root)) {
                throw new BadRequestException("Invalid storage path");
            }
            file.transferTo(target);
            return new StoredFile(root.relativize(target).toString(), original, contentType, file.getSize());
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store uploaded file", e);
        }
    }

    public Resource loadAsResource(String storedPath) {
        Path filePath = root.resolve(storedPath).normalize();
        if (!filePath.startsWith(root)) {
            throw new BadRequestException("Invalid storage path");
        }
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Stored file not found");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Stored file not found");
        }
    }

    private String extensionOf(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : "";
    }
}
