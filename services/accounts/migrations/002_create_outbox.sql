-- Up Migration
CREATE TABLE IF NOT EXISTS outbox (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     topic text NOT NULL,
     key text NOT NULL,
     payload jsonb NOT NULL,
     created_at timestamptz NOT NULL DEFAULT now(),
     published_at timestamptz
);

-- Down Migration
DROP TABLE IF EXISTS outbox;
