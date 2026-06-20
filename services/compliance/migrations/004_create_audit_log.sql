-- Up Migration
CREATE TABLE IF NOT EXISTS audit_log (
     id bigserial PRIMARY KEY,
     event_id uuid NOT NULL,
     user_id text NOT NULL,
     event_type text NOT NULL,
     occurred_at timestamptz NOT NULL,
     payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS audit_log_user_id_occurred_at_idx ON audit_log (user_id, occurred_at);

-- Down Migration
DROP TABLE IF EXISTS audit_log;
