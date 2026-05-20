CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  origin_transcript TEXT NOT NULL,
  transcript TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_points JSONB NOT NULL,
  CONSTRAINT meetings_key_points_is_array
    CHECK (jsonb_typeof(key_points) = 'array')
);

CREATE TABLE IF NOT EXISTS meeting_memos (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meeting_id UUID NOT NULL
    REFERENCES meetings (id)
    ON DELETE CASCADE,
  content TEXT NOT NULL,
  CONSTRAINT meeting_memos_content_length
    CHECK (char_length(content) BETWEEN 1 AND 500)
);

CREATE INDEX IF NOT EXISTS meetings_meeting_date_idx
  ON meetings (meeting_date);

CREATE INDEX IF NOT EXISTS meetings_meeting_date_created_at_idx
  ON meetings (meeting_date, created_at ASC);

CREATE INDEX IF NOT EXISTS meeting_memos_meeting_id_id_idx
  ON meeting_memos (meeting_id, id ASC);
