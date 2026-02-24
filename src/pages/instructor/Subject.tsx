import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, UserCheck, FileText, ClipboardList, FolderKanban, GraduationCap, Loader2, Plus, CalendarDays, Check, X } from "lucide-react";

interface SubjectData {
  id: string;
  name: string;
  subject_code: string;
  description: string | null;
  program_id: string | null;
}

interface ProgramData {
  id: string;
  name: string;
}

interface EnrolledStudent {
  student_id: string;
  full_name: string | null;
}

interface AttendanceSession {
  id: string;
  session_date: string;
  created_at: string;
}

interface AttendanceRecord {
  student_id: string;
  status: string;
}

export default function InstructorSubject() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subject, setSubject] = useState<SubjectData | null>(null);
  const [program, setProgram] = useState<ProgramData | null>(null);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subjectId && user) {
      loadSubject();
    }
  }, [subjectId, user]);

  const loadSubject = async () => {
    if (!subjectId || !user) return;

    const { data: subjectData, error: subjectError } = await supabase
      .from("subjects")
      .select("id, name, subject_code, description, program_id")
      .eq("id", subjectId)
      .eq("instructor_id", user.id)
      .single();

    if (subjectError || !subjectData) {
      toast({
        title: "Error",
        description: "Subject not found or you don't have access.",
        variant: "destructive",
      });
      navigate("/instructor");
      return;
    }

    setSubject(subjectData);

    if (subjectData.program_id) {
      const { data: programData } = await supabase
        .from("programs" as any)
        .select("id, name")
        .eq("id", subjectData.program_id)
        .single();

      if (programData) {
        setProgram(programData as any);
      }
    }

    setLoading(false);
    loadStudents();
  };

  const loadStudents = async () => {
    if (!subjectId) return;
    setStudentsLoading(true);

    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select("student_id")
      .eq("subject_id", subjectId);

    if (error || !enrollments?.length) {
      setStudents([]);
      setStudentsLoading(false);
      return;
    }

    const studentIds = enrollments.map((e) => e.student_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", studentIds);

    setStudents(
      studentIds.map((id) => ({
        student_id: id,
        full_name: profiles?.find((p) => p.user_id === id)?.full_name ?? null,
      }))
    );
    setStudentsLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-instructor" />
      </div>
    );
  }

  if (!subject) return null;

  const tabItems = [
    { value: "students", label: "Students", icon: UserCheck },
    { value: "attendance", label: "Attendance", icon: Users, description: "Manage and track student attendance for this subject.", emptyText: "No attendance records yet.", emptySubtext: "Attendance management features will be available here." },
    { value: "assignments", label: "Assignments", icon: FileText, description: "Create and manage assignments for this subject.", emptyText: "No assignments created yet.", emptySubtext: "Assignment management features will be available here." },
    { value: "quizzes", label: "Quizzes", icon: ClipboardList, description: "Create and manage quizzes for this subject.", emptyText: "No quizzes created yet.", emptySubtext: "Quiz management features will be available here." },
    { value: "projects", label: "Projects", icon: FolderKanban, description: "Create and manage projects for this subject.", emptyText: "No projects created yet.", emptySubtext: "Project management features will be available here." },
    { value: "exams", label: "Exams", icon: GraduationCap, description: "Create and manage exams for this subject.", emptyText: "No exams scheduled yet.", emptySubtext: "Exam management features will be available here." },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/instructor")}
          className="mt-1 text-muted-foreground hover:text-instructor"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-instructor bg-instructor/10 px-2 py-0.5 rounded">
              {subject.subject_code}
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mt-1">
            {subject.name}
          </h1>
          {program && (
            <p className="mt-1 text-muted-foreground text-sm flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5" />
              {program.name}
            </p>
          )}
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="w-full justify-start bg-muted/50 border border-border">
          {tabItems.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 data-[state=active]:bg-instructor data-[state=active]:text-instructor-foreground"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card className="border-instructor/20">
            <CardHeader>
              <CardTitle className="text-foreground">Enrolled Students</CardTitle>
              <CardDescription>Students currently enrolled in this subject.</CardDescription>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-instructor" />
                </div>
              ) : students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <UserCheck className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No students enrolled yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Students can enroll using the subject code.</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {students.map((s, i) => (
                    <li key={s.student_id} className="flex items-center gap-3 py-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-instructor/10 text-instructor text-sm font-semibold">
                        {i + 1}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {s.full_name || "Unnamed Student"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Tabs */}
        {tabItems.filter(t => t.value !== "students").map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <Card className="border-instructor/20">
              <CardHeader>
                <CardTitle className="text-foreground">{tab.label}</CardTitle>
                <CardDescription>{(tab as any).description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <tab.icon className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">{(tab as any).emptyText}</p>
                  <p className="text-xs text-muted-foreground mt-1">{(tab as any).emptySubtext}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
