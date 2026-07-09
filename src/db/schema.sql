CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  first_author TEXT NOT NULL,
  domain TEXT NOT NULL CHECK (domain IN (
    'Computer Science', 'Biology', 'Physics', 'Chemistry', 'Mathematics', 'Social Sciences'
  )),
  reading_stage TEXT NOT NULL CHECK (reading_stage IN (
    'Abstract Read', 'Introduction Done', 'Methodology Done', 'Results Analyzed', 'Fully Read', 'Notes Completed'
  )),
  citation_count INTEGER NOT NULL DEFAULT 0 CHECK (citation_count >= 0),
  impact_score TEXT NOT NULL CHECK (impact_score IN (
    'High Impact', 'Medium Impact', 'Low Impact', 'Unknown'
  )),
  date_added DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_papers_domain ON papers (domain);
CREATE INDEX IF NOT EXISTS idx_papers_reading_stage ON papers (reading_stage);
CREATE INDEX IF NOT EXISTS idx_papers_impact_score ON papers (impact_score);
CREATE INDEX IF NOT EXISTS idx_papers_date_added ON papers (date_added);
