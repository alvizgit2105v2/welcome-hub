CREATE POLICY "Instructors can view enrolled student profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM enrollments e
    JOIN subjects s ON s.id = e.subject_id
    WHERE e.student_id = profiles.user_id
      AND s.instructor_id = auth.uid()
  )
);