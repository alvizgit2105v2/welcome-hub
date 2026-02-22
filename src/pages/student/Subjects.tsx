import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EnrolledSubject {
  id: string;
  subject_id: string;
  enrolled_at: string;
  subjects: {
    id: string;
    subject_code: string;
    name: string;
    description: string | null;
  };
}

export default function StudentSubjects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<EnrolledSubject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("enrollments")
      .select("id, subject_id, enrolled_at, subjects(id, subject_code, name, description)")
      .eq("student_id", user.id)
      .order("enrolled_at", { ascending: false })
      .then(({ data }) => {
        if (data) setEnrollments(data as unknown as EnrolledSubject[]);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-student" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">My Subjects</h1>
        <p className="mt-2 text-muted-foreground">View all your enrolled subjects.</p>
      </div>

      {enrollments.length === 0 ? (
        <Card className="border-dashed border-student/20">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No subjects enrolled yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Go to the Dashboard to enroll using a subject code.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <Card
              key={enrollment.id}
              className="border-student/20 hover:border-student/40 transition-all cursor-pointer hover:shadow-md hover:shadow-student/5"
              onClick={() => navigate(`/student/subject/${enrollment.subject_id}`)}
            >
              <CardHeader className="pb-2">
                <span className="text-xs font-mono font-semibold text-student bg-student/10 px-2 py-0.5 rounded w-fit">
                  {enrollment.subjects.subject_code}
                </span>
                <CardTitle className="text-lg text-foreground mt-2">{enrollment.subjects.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {enrollment.subjects.description || "No description provided."}
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
