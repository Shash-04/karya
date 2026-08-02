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

[Unreleased]: https://github.com/shashwat110/taskforge/commits/main
