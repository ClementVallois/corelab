-- Up Migration
CREATE TABLE IF NOT EXISTS users (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     email text UNIQUE NOT NULL,
     password_hash text NOT NULL,
     deposit_limit_cents int NOT NULL DEFAULT 50000,
     created_at timestamptz NOT NULL DEFAULT now()
);

-- Down Migration
DROP TABLE IF EXISTS users;
