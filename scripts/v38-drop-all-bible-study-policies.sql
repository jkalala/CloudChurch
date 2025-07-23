-- Drop ALL policies on Bible Study module tables

-- bible_studies
DO $$ DECLARE r record;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'bible_studies' LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s" ON bible_studies;', r.policyname);
  END LOOP;
END $$;

-- bible_study_lessons
DO $$ DECLARE r record;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'bible_study_lessons' LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s" ON bible_study_lessons;', r.policyname);
  END LOOP;
END $$;

-- bible_study_groups
DO $$ DECLARE r record;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'bible_study_groups' LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s" ON bible_study_groups;', r.policyname);
  END LOOP;
END $$;

-- bible_study_discussions
DO $$ DECLARE r record;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'bible_study_discussions' LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s" ON bible_study_discussions;', r.policyname);
  END LOOP;
END $$; 