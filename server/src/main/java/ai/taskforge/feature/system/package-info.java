/**
 * System feature slice: read-only introspection for authenticated users —
 * effective non-sensitive configuration and live runtime telemetry
 * (worker pool, queue depth, task counts, Redis INFO, JVM, DB pool).
 * External reads fail soft rather than fabricating figures.
 */
package ai.taskforge.feature.system;
