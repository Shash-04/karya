package ai.taskforge.feature.task;

import ai.taskforge.common.ApiResponse;
import ai.taskforge.common.PageResponse;
import ai.taskforge.domain.enums.TaskStatus;
import ai.taskforge.domain.enums.TaskType;
import ai.taskforge.feature.task.dto.CreateTaskRequest;
import ai.taskforge.feature.task.dto.TaskDetailResponse;
import ai.taskforge.feature.task.dto.TaskResponse;
import ai.taskforge.feature.task.dto.TaskStatsResponse;
import ai.taskforge.feature.task.dto.UpdateTaskRequest;
import ai.taskforge.feature.task.dto.AttachmentResponse;
import ai.taskforge.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/tasks")
@Tag(name = "Tasks", description = "Create and manage tasks; results are processed asynchronously")
public class TaskController {

    private final TaskService taskService;
    private final AttachmentService attachmentService;

    public TaskController(TaskService taskService, AttachmentService attachmentService) {
        this.taskService = taskService;
        this.attachmentService = attachmentService;
    }

    @PostMapping
    @Operation(summary = "Create a task and queue it for processing")
    public ResponseEntity<ApiResponse<TaskResponse>> create(@Valid @RequestBody CreateTaskRequest request) {
        TaskResponse created = taskService.create(SecurityUtils.currentUserId(), request);
        // 202: accepted for asynchronous processing.
        return ResponseEntity.accepted().body(ApiResponse.ok("Task accepted for processing", created));
    }

    @GetMapping
    @Operation(summary = "List the current user's tasks (search, filter, sort, paginate)")
    public ResponseEntity<ApiResponse<PageResponse<TaskResponse>>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String order) {
        PageResponse<TaskResponse> result = taskService.list(
                SecurityUtils.currentUserId(), search, status, type, page, size, sortBy, order);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Task detail with execution logs")
    public ResponseEntity<ApiResponse<TaskDetailResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.getDetail(SecurityUtils.currentUserId(), id)));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update a task (only while pending)")
    public ResponseEntity<ApiResponse<TaskResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody UpdateTaskRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Task updated",
                taskService.update(SecurityUtils.currentUserId(), id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a task")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        taskService.delete(SecurityUtils.currentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/retry")
    @Operation(summary = "Retry a failed task")
    public ResponseEntity<ApiResponse<TaskResponse>> retry(@PathVariable UUID id) {
        TaskResponse retried = taskService.retry(SecurityUtils.currentUserId(), id);
        return ResponseEntity.accepted().body(ApiResponse.ok("Task re-queued", retried));
    }

    @GetMapping("/stats/summary")
    @Operation(summary = "Dashboard counts and live queue status")
    public ResponseEntity<ApiResponse<TaskStatsResponse>> stats() {
        return ResponseEntity.ok(ApiResponse.ok(taskService.stats(SecurityUtils.currentUserId())));
    }

    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload an image or PDF attachment to a task")
    public ResponseEntity<ApiResponse<AttachmentResponse>> uploadAttachment(
            @PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        AttachmentResponse uploaded = attachmentService.upload(SecurityUtils.currentUserId(), id, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("File uploaded", uploaded));
    }

    @GetMapping("/{id}/attachments")
    @Operation(summary = "List a task's attachments")
    public ResponseEntity<ApiResponse<List<AttachmentResponse>>> listAttachments(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(attachmentService.list(SecurityUtils.currentUserId(), id)));
    }

    @GetMapping("/{id}/attachments/{attachmentId}")
    @Operation(summary = "Download an attachment")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable UUID id, @PathVariable UUID attachmentId) {
        AttachmentService.DownloadableFile file =
                attachmentService.download(SecurityUtils.currentUserId(), id, attachmentId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.filename() + "\"")
                .body(file.resource());
    }
}
