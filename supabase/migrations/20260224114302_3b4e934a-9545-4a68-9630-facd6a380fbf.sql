
-- Attendance sessions table
CREATE TABLE public.attendance_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subject_id, session_date)
);

ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can manage attendance sessions for their subjects"
ON public.attendance_sessions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM subjects s WHERE s.id = attendance_sessions.subject_id AND s.instructor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM subjects s WHERE s.id = attendance_sessions.subject_id AND s.instructor_id = auth.uid()
  )
);

-- Attendance records table
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'absent' CHECK (status IN ('present', 'absent')),
  UNIQUE(session_id, student_id)
);

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can manage attendance records for their subjects"
ON public.attendance_records
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM attendance_sessions a
    JOIN subjects s ON s.id = a.subject_id
    WHERE a.id = attendance_records.session_id AND s.instructor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM attendance_sessions a
    JOIN subjects s ON s.id = a.subject_id
    WHERE a.id = attendance_records.session_id AND s.instructor_id = auth.uid()
  )
);

CREATE POLICY "Students can view own attendance records"
ON public.attendance_records
FOR SELECT
USING (auth.uid() = student_id);
