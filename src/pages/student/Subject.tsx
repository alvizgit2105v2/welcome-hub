import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ClipboardCheck, FileText, HelpCircle, FolderKanban, GraduationCap, Loader2 } from "lucide-react";

interface SubjectData {
  id: string;
  subject_code: string;
  name: string;
  description: string | null;
}

interface AttendanceRow {
  session_date: string;
  status: string;
}

export default function StudentSubject() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<SubjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRow[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    if (!user || !subjectId) return;

    supabase
      .from("subjects")
      .select("id, subject_code, name, description")
      .eq("id", subjectId)
      .single()
      .then(({ data }) => {
        if (data) setSubject(data);
        setLoading(false);
      });
  }, [user, subjectId]);

  useEffect(() => {
    if (!user || !subjectId) return;
    setAttendanceLoading(true);

    // Get all sessions for this subject, then get student's records
    const loadAttendance = async () => {
      const { data: sessions } = await supabase
        .from("attendance_sessions")
        .select("id, session_date")
        .eq("subject_id", subjectId)
        .order("session_date", { ascending: true });

      if (!sessions || sessions.length === 0) {
        setAttendanceHistory([]);
        setAttendanceLoading(false);
        return;
      }

      const sessionIds = sessions.map((s) => s.id);
      const { data: records } = await supabase
        .from("attendance_records")
        .select("session_id, status")
        .eq("student_id", user.id)
        .in("session_id", sessionIds);

      const recordMap = new Map(records?.map((r) => [r.session_id, r.status]) ?? []);

      const history: AttendanceRow[] = sessions.map((s) => ({
        session_date: s.session_date,
        status: recordMap.get(s.id) ?? "No Record",
      }));

      setAttendanceHistory(history);
      setAttendanceLoading(false);
    };

    loadAttendance();
  }, [user, subjectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-student" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Subject not found.</p>
        <Button variant="outline" onClick={() => navigate("/student")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const tabItems = [
    { value: "attendance", label: "Attendance", icon: ClipboardCheck },
    { value: "assignments", label: "Assignments", icon: FileText },
    { value: "quizzes", label: "Quizzes", icon: HelpCircle },
    { value: "projects", label: "Projects", icon: FolderKanban },
    { value: "exams", label: "Exams", icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/student")}
          className="mt-1 text-muted-foreground hover:text-student"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-student bg-student/10 px-2 py-0.5 rounded">
              {subject.subject_code}
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mt-1">
            {subject.name}
          </h1>
          {subject.description && (
            <p className="mt-1 text-muted-foreground text-sm">{subject.description}</p>
          )}
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="w-full justify-start bg-muted/50 border border-border">
          {tabItems.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 data-[state=active]:bg-student data-[state=active]:text-student-foreground"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="attendance">
          <Card className="border-student/20">
            <CardHeader>
              <CardTitle className="text-foreground">Attendance Records</CardTitle>
              <CardDescription>View your attendance history and mark presence when allowed.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ClipboardCheck className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No attendance records yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Records will appear here once your instructor starts tracking attendance.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card className="border-student/20">
            <CardHeader>
              <CardTitle className="text-foreground">Assignments</CardTitle>
              <CardDescription>Upload submissions and view your grades.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No assignments posted yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Assignments from your instructor will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes">
          <Card className="border-student/20">
            <CardHeader>
              <CardTitle className="text-foreground">Quizzes</CardTitle>
              <CardDescription>Take quizzes and view your results.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <HelpCircle className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No quizzes available yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Quizzes will appear here when your instructor creates them.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card className="border-student/20">
            <CardHeader>
              <CardTitle className="text-foreground">Projects</CardTitle>
              <CardDescription>Collaborate on projects and track your progress.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FolderKanban className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No projects assigned yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Project details will appear here when assigned.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card className="border-student/20">
            <CardHeader>
              <CardTitle className="text-foreground">Exams</CardTitle>
              <CardDescription>View schedules, submit answers, and check your scores.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <GraduationCap className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No exams scheduled yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Exam information will appear here when your instructor schedules them.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
