
-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can manage assignments for their subjects"
  ON public.assignments FOR ALL
  USING (EXISTS (SELECT 1 FROM subjects s WHERE s.id = assignments.subject_id AND s.instructor_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM subjects s WHERE s.id = assignments.subject_id AND s.instructor_id = auth.uid()));

CREATE POLICY "Students can view assignments for enrolled subjects"
  ON public.assignments FOR SELECT
  USING (EXISTS (SELECT 1 FROM enrollments e WHERE e.subject_id = assignments.subject_id AND e.student_id = auth.uid()));

-- Storage bucket for assignment files
INSERT INTO storage.buckets (id, name, public) VALUES ('assignments', 'assignments', true);

-- Storage policies
CREATE POLICY "Instructors can upload assignment files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'assignments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone authenticated can view assignment files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'assignments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Instructors can delete assignment files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'assignments' AND auth.uid() IS NOT NULL);
