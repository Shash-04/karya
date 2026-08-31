package ai.taskforge.feature.system;

import ai.taskforge.common.ApiResponse;
import ai.taskforge.feature.system.dto.SystemConfigResponse;
import ai.taskforge.feature.system.dto.SystemTelemetryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Read-only system introspection for any authenticated user: effective
 * (non-sensitive) configuration and live runtime telemetry.
 */
@RestController
@RequestMapping("/api/v1/system")
@Tag(name = "System", description = "Effective configuration and live runtime telemetry")
public class SystemController {

    private final SystemService systemService;

    public SystemController(SystemService systemService) {
        this.systemService = systemService;
    }

    @GetMapping("/config")
    @Operation(summary = "Effective non-sensitive configuration (worker, queue, limits, JWT, storage)")
    public ResponseEntity<ApiResponse<SystemConfigResponse>> config() {
        return ResponseEntity.ok(ApiResponse.ok(systemService.config()));
    }

    @GetMapping("/telemetry")
    @Operation(summary = "Live worker-pool, queue, task, Redis, JVM and DB-pool telemetry")
    public ResponseEntity<ApiResponse<SystemTelemetryResponse>> telemetry() {
        return ResponseEntity.ok(ApiResponse.ok(systemService.telemetry()));
    }
}
