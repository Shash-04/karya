-- Secondary indexes for the hot query paths.
-- (users.email is already uniquely indexed via uq_users_email in V1.)

-- Dashboard/list: "my tasks filtered by status" and status rollups.
CREATE INDEX idx_tasks_user_status ON tasks (user_id, status);
CREATE INDEX idx_tasks_status      ON tasks (status);
CREATE INDEX idx_tasks_created_at  ON tasks (created_at);

-- Task detail: fetch a task's logs.
CREATE INDEX idx_task_logs_task_id ON task_logs (task_id);

-- Refresh-token lookup by hash on refresh/rotate.
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);
