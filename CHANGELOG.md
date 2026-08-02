# Changelog

All notable changes to TaskForge are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
(`MAJOR.MINOR.PATCH`):

- **MAJOR** — incompatible API or schema changes
- **MINOR** — new functionality, backwards-compatible
- **PATCH** — backwards-compatible bug fixes

## [Unreleased]

### Added
- Root repository hygiene: `.gitignore`, `.env.example`, and this `CHANGELOG.md`.
- Spring Boot 3.3 backend scaffold under `server/` (Maven, Java 21): dependencies
  for web, security, JPA, Redis, validation, WebSocket, actuator, Flyway, JWT
  (jjwt), and springdoc OpenAPI.
- Layered `application.yml` configuration with `dev` and `docker` profiles.
- Package-by-feature source skeleton (`config`, `security`, `common`, `feature/*`,
  `domain/*`, `queue`, `websocket`, `storage`), each documented via `package-info`.
- `docker-compose.yml` with `postgres:16` and `redis:7` (healthchecks, volumes).
- Flyway migrations `V1`–`V6`: `users`, `tasks`, `task_logs`, `refresh_tokens`,
  `attachments`, plus secondary indexes.
- Domain layer: `Role`/`TaskStatus`/`TaskType` enums, JPA entities for all five
  tables (UUID keys, JSONB payload/result, auditing timestamps), and Spring Data
  repositories (with `JpaSpecificationExecutor` on tasks for search/filter).
- Stateless JWT security: `SecurityConfig` (CORS, role rules, JSON 401/403),
  `JwtService` (HS256 access tokens), `JwtAuthenticationFilter`, BCrypt.
- Auth API (`/api/v1/auth`): register, login, refresh-token (with rotation),
  logout, and `me`. Opaque, hashed, rotated refresh tokens.
- Task API (`/api/v1/tasks`): create (202 + enqueue), list (search/filter/sort/
  paginate), detail-with-logs, update-while-pending, delete, retry, stats summary.
- Redis queue + async worker: `@Scheduled` poller promotes delayed → ready and
  drains onto a dedicated worker thread pool; per-type simulated processors with
  progress reporting; retry-with-backoff and scheduled execution.
- WebSocket live updates: STOMP endpoint at `/ws` with JWT-authenticated handshake;
  task status/progress broadcast per-user over `/user/queue/tasks` (after commit).
- File attachments: upload (images/PDF), list, and download task attachments
  (`/api/v1/tasks/{id}/attachments`), with content-type validation, size limits,
  path-traversal guards, and owner scoping.
- Admin views (`/api/v1/admin`, ADMIN-only): all tasks, users with task counts,
  and platform-wide queue metrics.
- Rate limiting: Redis fixed-window throttling on auth (per IP) and task creation
  (per user), returning 429 with `Retry-After`.
- Startup seeding: idempotent demo accounts (user/admin) and sample tasks across
  all statuses; gated by `taskforge.seed.enabled`.
- Backend Docker image (multi-stage, non-root, health check) and a `docker compose`
  `backend` service wired to postgres + redis; full stack runs with one command.
- Unit tests (JUnit 5 + Mockito): JWT, refresh-token rotation, auth (register/login),
  task lifecycle (create/update/retry), worker retry logic, and rate limiting.

[Unreleased]: https://github.com/shashwat110/taskforge/commits/main
