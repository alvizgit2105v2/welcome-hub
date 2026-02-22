import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, BookOpen, Users, FileText, ClipboardList, FolderKanban, GraduationCap, Loader2 } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  subject_code: string;
  description: string | null;
  program_id: string | null;
  created_at: string;
}

interface Program {
  id: string;
  name: string;
}

export default function InstructorSubject() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
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
      .select("*")
      .eq("id", subjectId)
      .eq("instructor_id", user.id)
      .single();

    if (subjectError) {
      toast({
        title: "Error",
        description: "Subject not found or you don't have access.",
        variant: "destructive",
      });
      navigate("/instructor");
      return;
    }

    setSubject(subjectData);

    // Load program if program_id exists
    if (subjectData.program_id) {
      const { data: programData } = await supabase
        .from("programs")
        .select("id, name")
        .eq("id", subjectData.program_id)
        .single();

      if (programData) {
        setProgram(programData);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-instructor" />
      </div>
    );
  }

  if (!subject) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/instructor")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            {subject.name}
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-muted-foreground">
              Code: {subject.subject_code}
            </p>
            {program && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                <span>{program.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="attendance" className="data-[state=active]:bg-instructor/10 data-[state=active]:text-instructor">
            <Users className="mr-2 h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-instructor/10 data-[state=active]:text-instructor">
            <FileText className="mr-2 h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="data-[state=active]:bg-instructor/10 data-[state=active]:text-instructor">
            <ClipboardList className="mr-2 h-4 w-4" />
            Quizzes
          </TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-instructor/10 data-[state=active]:text-instructor">
            <FolderKanban className="mr-2 h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="exams" className="data-[state=active]:bg-instructor/10 data-[state=active]:text-instructor">
            <GraduationCap className="mr-2 h-4 w-4" />
            Exams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-6">
          <Card className="border-instructor/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Users className="h-5 w-5 text-instructor" />
                Attendance
              </CardTitle>
              <CardDescription>
                Manage and track student attendance for this subject.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Attendance management features will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <Card className="border-instructor/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FileText className="h-5 w-5 text-instructor" />
                Assignments
              </CardTitle>
              <CardDescription>
                Create and manage assignments for this subject.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Assignment management features will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="mt-6">
          <Card className="border-instructor/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <ClipboardList className="h-5 w-5 text-instructor" />
                Quizzes
              </CardTitle>
              <CardDescription>
                Create and manage quizzes for this subject.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Quiz management features will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <Card className="border-instructor/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FolderKanban className="h-5 w-5 text-instructor" />
                Projects
              </CardTitle>
              <CardDescription>
                Create and manage projects for this subject.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Project management features will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="mt-6">
          <Card className="border-instructor/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <GraduationCap className="h-5 w-5 text-instructor" />
                Exams
              </CardTitle>
              <CardDescription>
                Create and manage exams for this subject.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Exam management features will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

