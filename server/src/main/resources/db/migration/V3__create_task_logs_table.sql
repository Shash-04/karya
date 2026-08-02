-- Task logs: append-only execution log lines emitted by the worker.
CREATE TABLE task_logs (
    id         BIGSERIAL   PRIMARY KEY,
    task_id    UUID        NOT NULL,
    level      VARCHAR(10) NOT NULL DEFAULT 'INFO',
    message    TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_task_logs_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
);
