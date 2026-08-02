package ai.taskforge.storage;

/** Metadata returned after a file is written to storage. */
public record StoredFile(String storedPath, String originalFilename, String contentType, long size) {
}
