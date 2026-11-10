-- Organiser rules: giver must not draw receiver.
CREATE TABLE IF NOT EXISTS exclusions (
  group_code TEXT NOT NULL REFERENCES groups(code) ON DELETE CASCADE,
  giver_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  PRIMARY KEY (group_code, giver_id, receiver_id)
);
