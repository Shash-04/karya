-- Attachments: uploaded images/PDFs referenced by a task.
CREATE TABLE attachments (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id           UUID         NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_path       VARCHAR(500) NOT NULL,
    content_type      VARCHAR(100) NOT NULL,
    size_bytes        BIGINT       NOT NULL,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_attachments_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
);
