-- Bible Study: Studies
CREATE TABLE IF NOT EXISTS bible_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  difficulty TEXT,
  category TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bible Study: Groups
CREATE TABLE IF NOT EXISTS bible_study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  current_study UUID REFERENCES bible_studies(id),
  meeting_time TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bible Study: Group Members
CREATE TABLE IF NOT EXISTS bible_study_group_members (
  group_id UUID REFERENCES bible_study_groups(id) ON DELETE CASCADE,
  user_id TEXT,
  role TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Bible Study: Lessons
CREATE TABLE IF NOT EXISTS bible_study_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID REFERENCES bible_studies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration INT,
  order_index INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bible Study: Lesson Verses
CREATE TABLE IF NOT EXISTS bible_study_lesson_verses (
  lesson_id UUID REFERENCES bible_study_lessons(id) ON DELETE CASCADE,
  book TEXT,
  chapter INT,
  verse INT,
  text TEXT,
  reference TEXT,
  PRIMARY KEY (lesson_id, book, chapter, verse)
);

-- Bible Study: Discussions
CREATE TABLE IF NOT EXISTS bible_study_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID REFERENCES bible_studies(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES bible_study_lessons(id) ON DELETE CASCADE,
  author_id TEXT,
  content TEXT,
  parent_id UUID REFERENCES bible_study_discussions(id) ON DELETE CASCADE,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bible Study: Progress
CREATE TABLE IF NOT EXISTS bible_study_progress (
  user_id TEXT,
  study_id UUID REFERENCES bible_studies(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES bible_study_lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, study_id, lesson_id)
); 