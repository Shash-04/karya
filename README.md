# TaskForge

**Task automation & job processing platform.** Users create tasks; each task is
persisted, pushed onto a Redis queue, and processed asynchronously by a background
worker that reports progress and status live over WebSocket. Built as a
production-shaped micro-SaaS module — clean architecture over feature count.

> Backend: **Java 21 · Spring Boot 3.3**. Frontend: **Next.js + TypeScript** (in progress).

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Folder structure](#folder-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API documentation](#api-documentation)
- [Demo accounts](#demo-accounts)
- [Testing](#testing)
- [Assumptions](#assumptions)
- [Trade-offs](#trade-offs)
- [Future improvements](#future-improvements)

## Features

- **JWT authentication** with refresh-token rotation, BCrypt hashing, role-based
  access (USER / ADMIN).
- **Task lifecycle**: create → queue → process → complete/fail, with retry and
  scheduling. Search, filter, sort, and pagination.
- **Redis queue + async worker**: dedicated thread pool, retry-with-backoff,
  scheduled (delayed) execution, per-task progress and logs.
- **Live updates** over WebSocket (STOMP) — each user sees only their own tasks.
- **File attachments** (images/PDF) per task, with validation.
- **Admin**: all-tasks view, user list, platform queue metrics.
- **Rate limiting** on auth and task creation (Redis fixed-window).
- **Centralized API envelope**, global exception handling, OpenAPI/Swagger docs.
- **Docker**: one command brings up Postgres, Redis, and the backend.

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | Java 21, Spring Boot 3.3 (Web, Security, Data JPA, Data Redis, WebSocket, Validation, Actuator) |
| Database | PostgreSQL 16, Flyway migrations |
| Queue / cache / sessions | Redis 7 (Spring Data Redis) |
| Auth | JWT (jjwt), Spring Security, BCrypt |
| Docs | springdoc-openapi (Swagger UI) |
| Build / tests | Maven, JUnit 5, Mockito |
| Frontend | Next.js, TypeScript, Redux Toolkit, TanStack Query *(in progress)* |
| DevOps | Docker, docker-compose, GitHub Actions |

## Architecture

```
        ┌─────────────────────────────┐
        │   Next.js Frontend (TS)      │
        └──────┬───────────────┬───────┘
          REST │               │ WebSocket (STOMP)
               ▼               ▼
        ┌─────────────────────────────────┐
        │      Spring Boot Application      │
        │  Security (JWT) · Controller →   │
        │  Service → Repository            │
        │  Queue producer + worker pool    │
        └───────┬──────────────────┬───────┘
             JPA│                  │Redis
                ▼                  ▼
        ┌──────────────┐   ┌──────────────────┐
        │  PostgreSQL  │   │      Redis        │
        │  users/tasks │   │  ready list       │
        │  logs/tokens │   │  delayed zset     │
        │  attachments │   │  rate-limit keys  │
        └──────────────┘   └──────────────────┘
```

**Flow:** `POST /tasks` saves the task as `PENDING` and pushes its id to Redis,
returning `202` immediately. A scheduled poller promotes any due (delayed) tasks
and drains the ready list onto the worker thread pool. The worker marks the task
`PROCESSING`, runs the type's processor (reporting progress), then `COMPLETED`, or
on error retries with backoff and finally `FAILED`. Every transition is streamed to
the owning user over WebSocket.

## Folder structure

```
taskforge/
├── docker-compose.yml         # postgres + redis + backend
├── .env.example
├── CHANGELOG.md
├── postman/                   # Postman collection
├── .github/workflows/ci.yml   # build + test
├── server/                    # Spring Boot backend
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/ai/taskforge/
│       ├── config/            # Redis, WebSocket, async, OpenAPI, properties
│       ├── security/          # JWT, filter chain, rate limiting
│       ├── common/            # ApiResponse, exceptions, paging
│       ├── feature/           # auth, task, admin (controller→service→dto)
│       ├── domain/            # entity, enums, repository
│       ├── queue/             # producer, poller, worker, processors
│       ├── websocket/         # live status broadcasting
│       ├── storage/           # file uploads
│       └── bootstrap/         # seed data
└── client/                    # Next.js frontend (in progress)
```

## Getting started

### Prerequisites

- Docker + Docker Compose
- (For local, non-Docker backend runs) JDK 21 and Maven

### Run everything with Docker

```bash
git clone <repo-url> taskforge
cd taskforge
cp .env.example .env         # adjust secrets as needed
docker compose up --build -d
```

| Service | URL |
| --- | --- |
| API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Health | http://localhost:8080/actuator/health |
| Postgres | localhost:5432 |
| Redis | localhost:6379 |

### Run the backend locally (infra in Docker)

```bash
docker compose up -d postgres redis
cd server
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## Environment variables

See [`.env.example`](.env.example) for the full list. Key values:

| Variable | Purpose |
| --- | --- |
| `SPRING_DATASOURCE_URL` / `_USERNAME` / `_PASSWORD` | Postgres connection |
| `SPRING_DATA_REDIS_HOST` / `_PORT` | Redis connection |
| `JWT_SECRET` | HMAC signing secret (≥ 32 bytes) |
| `JWT_ACCESS_EXPIRY` / `JWT_REFRESH_EXPIRY` | Token lifetimes (ms) |
| `QUEUE_MAX_ATTEMPTS` / `QUEUE_RETRY_DELAY` | Retry policy |
| `UPLOAD_PATH` / `MAX_FILE_SIZE` | File storage |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origin(s) |

## API documentation

Base path `/api/v1`. Interactive docs at `/swagger-ui.html`. A Postman collection
is in [`postman/`](postman/).

| Area | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `/auth/login`, `/auth/refresh-token`, `/auth/logout`, `GET /auth/me` |
| Tasks | `POST /tasks`, `GET /tasks`, `GET /tasks/{id}`, `PATCH /tasks/{id}`, `DELETE /tasks/{id}`, `POST /tasks/{id}/retry`, `GET /tasks/stats/summary` |
| Attachments | `POST/GET /tasks/{id}/attachments`, `GET /tasks/{id}/attachments/{attachmentId}` |
| Admin | `GET /admin/tasks`, `/admin/users`, `/admin/queue/metrics` |
| WebSocket | connect `/ws` (JWT on CONNECT), subscribe `/user/queue/tasks` |

All responses use a common envelope:

```json
{ "success": true, "message": "Task created", "data": {}, "error": null, "timestamp": "2026-08-02T10:00:00Z" }
```

## Demo accounts

Seeded on first startup (disable with `SEED_ENABLED=false`):

| Role | Email | Password |
| --- | --- | --- |
| User | user@taskforge.ai | UserPassword123! |
| Admin | admin@taskforge.ai | AdminPassword123! |

## Testing

```bash
cd server
mvn test
```

JUnit 5 + Mockito unit tests cover JWT, refresh-token rotation, auth, task
lifecycle, worker retry logic, and rate limiting.

## Assumptions

- A single Redis instance serves the queue, cache, and rate-limit state.
- Task payloads are small; uploaded files are referenced, not queued.
- Access tokens are short-lived (15 min) and not revoked before expiry; refresh
  tokens are opaque, hashed, and rotated on use.
- Task processors are simulated stand-ins for real background work (see below).

## Trade-offs

- **PostgreSQL over MongoDB** — the data is relational (users, tasks, logs,
  attachments), so foreign keys and a normalized schema fit best.
- **Redis over a dedicated broker** — Redis is already required for cache/sessions,
  so reusing it for the queue avoids another moving part.
- **Flyway over Hibernate auto-DDL** — versioned, reviewable, repeatable migrations.
- **In-app worker on a dedicated thread pool** — keeps the API responsive while
  matching the async requirement, without operating a second deployable.

## Future improvements

- Replace simulated processors with real integrations (email/SMTP, OCR, exports).
- Email notifications on task completion/failure.
- Recurring / cron-style scheduled tasks.
- Cloud storage for uploads.
- Richer dashboard with charts and history filters.
- Bulk task creation via CSV upload.
