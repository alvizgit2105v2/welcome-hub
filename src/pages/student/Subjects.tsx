import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Loader2, ArrowRight } from "lucide-react";
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">My Subjects</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">View all your enrolled subjects.</p>
      </div>

      {enrollments.length === 0 ? (
        <Card className="border-dashed border-2 border-border shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-xl bg-muted p-4 mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No subjects enrolled yet</p>
            <p className="text-xs text-muted-foreground mt-1">Go to the Dashboard to enroll using a subject code.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <Card
              key={enrollment.id}
              className="shadow-card border-border/50 hover:shadow-elevated transition-all cursor-pointer group"
              onClick={() => navigate(`/student/subject/${enrollment.subject_id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-student bg-student/10 px-2 py-1 rounded-md uppercase tracking-wider">
                    {enrollment.subjects.subject_code}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-student group-hover:translate-x-0.5 transition-all" />
                </div>
                <CardTitle className="text-base text-foreground mt-2 font-display">{enrollment.subjects.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {enrollment.subjects.description || "No description provided."}
                </p>
                <p className="text-[10px] text-muted-foreground mt-3">
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
