ALTER TABLE session_feedback
ADD COLUMN IF NOT EXISTS viewed_at DATETIME NULL AFTER submitted_at;
