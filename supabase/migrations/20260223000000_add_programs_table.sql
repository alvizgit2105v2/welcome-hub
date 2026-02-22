-- Programs table (created by instructors)
CREATE TABLE public.programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  instructor_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(instructor_id, name)
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view programs
CREATE POLICY "Authenticated users can view programs"
  ON public.programs FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only the instructor who created it can modify
CREATE POLICY "Instructors can insert own programs"
  ON public.programs FOR INSERT
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update own programs"
  ON public.programs FOR UPDATE
  USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can delete own programs"
  ON public.programs FOR DELETE
  USING (auth.uid() = instructor_id);

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add program_id to subjects table
ALTER TABLE public.subjects ADD COLUMN program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL;

