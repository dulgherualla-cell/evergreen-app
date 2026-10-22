-- Evergreen Secret Santa: initial schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  pass_hash TEXT NOT NULL,
  pass_salt TEXT NOT NULL,
  avatar_icon TEXT,
  avatar_color TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS groups (
  code TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  budget TEXT,
  date TEXT,
  note TEXT,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_name TEXT,
  created_at INTEGER NOT NULL,
  drawn INTEGER NOT NULL DEFAULT 0,
  drawn_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_groups_owner ON groups(owner_id);

CREATE TABLE IF NOT EXISTS members (
  group_code TEXT NOT NULL REFERENCES groups(code) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_icon TEXT,
  avatar_color TEXT,
  joined_at INTEGER NOT NULL,
  PRIMARY KEY (group_code, user_id)
);
CREATE INDEX IF NOT EXISTS idx_members_user ON members(user_id);

CREATE TABLE IF NOT EXISTS invites (
  group_code TEXT NOT NULL REFERENCES groups(code) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (group_code, email)
);

CREATE TABLE IF NOT EXISTS answers (
  group_code TEXT NOT NULL REFERENCES groups(code) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (group_code, user_id)
);

CREATE TABLE IF NOT EXISTS pairs (
  group_code TEXT NOT NULL REFERENCES groups(code) ON DELETE CASCADE,
  giver_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  PRIMARY KEY (group_code, giver_id)
);
