package ai.taskforge.feature.admin;

import ai.taskforge.common.ApiResponse;
import ai.taskforge.common.PageResponse;
import ai.taskforge.domain.enums.TaskStatus;
import ai.taskforge.domain.enums.TaskType;
import ai.taskforge.feature.admin.dto.QueueMetricsResponse;
import ai.taskforge.feature.admin.dto.UserSummaryResponse;
import ai.taskforge.feature.task.dto.TaskResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Administrative views across all users (ADMIN only)")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/tasks")
    @Operation(summary = "List all tasks across every user")
    public ResponseEntity<ApiResponse<PageResponse<TaskResponse>>> allTasks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String order) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminService.listAllTasks(search, status, type, page, size, sortBy, order)));
    }

    @GetMapping("/users")
    @Operation(summary = "List users")
    public ResponseEntity<ApiResponse<PageResponse<UserSummaryResponse>>> users(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.listUsers(page, size)));
    }

    @GetMapping("/queue/metrics")
    @Operation(summary = "Platform-wide queue and task metrics")
    public ResponseEntity<ApiResponse<QueueMetricsResponse>> queueMetrics() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.queueMetrics()));
    }
}
