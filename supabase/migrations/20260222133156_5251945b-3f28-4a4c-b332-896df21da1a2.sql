
-- Subjects table (created by instructors)
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  instructor_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view subjects (needed for enrollment lookup)
CREATE POLICY "Authenticated users can view subjects"
  ON public.subjects FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only the instructor who created it can modify
CREATE POLICY "Instructors can insert own subjects"
  ON public.subjects FOR INSERT
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update own subjects"
  ON public.subjects FOR UPDATE
  USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can delete own subjects"
  ON public.subjects FOR DELETE
  USING (auth.uid() = instructor_id);

CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enrollments table
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own enrollments"
  ON public.enrollments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can enroll themselves"
  ON public.enrollments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can unenroll themselves"
  ON public.enrollments FOR DELETE
  USING (auth.uid() = student_id);

-- Instructors can view enrollments for their subjects
CREATE POLICY "Instructors can view enrollments for their subjects"
  ON public.enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects
      WHERE subjects.id = enrollments.subject_id
      AND subjects.instructor_id = auth.uid()
    )
  );
