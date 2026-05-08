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

CREATE INDEX IF NOT EXISTS meetings_meeting_date_idx
  ON meetings (meeting_date);

CREATE INDEX IF NOT EXISTS meetings_meeting_date_created_at_idx
  ON meetings (meeting_date, created_at ASC);
