-- Tasks: the unit of work pushed onto the Redis queue and processed async.
CREATE TABLE tasks (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID         NOT NULL,
    name          VARCHAR(200) NOT NULL,
    description   TEXT,
    type          VARCHAR(50)  NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    priority      INT          NOT NULL DEFAULT 0,
    payload       JSONB,
    result        JSONB,
    error_message TEXT,
    attempts      INT          NOT NULL DEFAULT 0,
    progress      INT          NOT NULL DEFAULT 0,
    scheduled_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
