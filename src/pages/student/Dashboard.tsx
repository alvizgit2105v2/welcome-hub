import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, User, PlusCircle, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<{ full_name: string | null; program: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [subjectCode, setSubjectCode] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollments, setEnrollments] = useState<EnrolledSubject[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("profiles")
      .select("full_name, program")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });

    fetchEnrollments();
  }, [user]);

  const fetchEnrollments = async () => {
    if (!user) return;
    setEnrollmentsLoading(true);
    const { data } = await supabase
      .from("enrollments")
      .select("id, subject_id, enrolled_at, subjects(id, subject_code, name, description)")
      .eq("student_id", user.id)
      .order("enrolled_at", { ascending: false });

    if (data) setEnrollments(data as unknown as EnrolledSubject[]);
    setEnrollmentsLoading(false);
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subjectCode.trim()) return;
    setEnrolling(true);

    const { data: subject, error: lookupError } = await supabase
      .from("subjects")
      .select("id, name")
      .eq("subject_code", subjectCode.trim().toUpperCase())
      .single();

    if (lookupError || !subject) {
      toast({ title: "Subject not found", description: "No subject matches that code.", variant: "destructive" });
      setEnrolling(false);
      return;
    }

    const { error: enrollError } = await supabase
      .from("enrollments")
      .insert({ student_id: user.id, subject_id: subject.id });

    if (enrollError) {
      if (enrollError.code === "23505") {
        toast({ title: "Already enrolled", description: `You are already enrolled in ${subject.name}.` });
      } else {
        toast({ title: "Enrollment failed", description: enrollError.message, variant: "destructive" });
      }
      setEnrolling(false);
      return;
    }

    toast({ title: "Enrolled!", description: `You have been enrolled in ${subject.name}.` });
    setSubjectCode("");
    setEnrolling(false);
    fetchEnrollments();
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Student";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-1">
          <Sparkles className="h-5 w-5 text-student" />
          <span className="text-xs font-medium text-student uppercase tracking-wider">Dashboard</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
          Welcome back, {displayName}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Here's an overview of your academic journey.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card border-border/50 hover:shadow-soft transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Program</CardTitle>
            <div className="rounded-lg bg-student/10 p-2">
              <GraduationCap className="h-4 w-4 text-student" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground font-display">
              {loading ? "..." : profile?.program || <span className="text-muted-foreground text-sm font-normal">Not set</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {profile?.program ? "Current program" : "Update in profile"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50 hover:shadow-soft transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subjects</CardTitle>
            <div className="rounded-lg bg-student/10 p-2">
              <BookOpen className="h-4 w-4 text-student" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground font-display">{enrollments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active enrollments</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50 hover:shadow-soft transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</CardTitle>
            <div className="rounded-lg bg-student/10 p-2">
              <User className="h-4 w-4 text-student" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-xl font-bold text-foreground font-display">Active</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{user?.email}</p>
          </CardContent>
        </Card>
      </div>

      {/* Enroll Subject Card */}
      <Card className="shadow-card border-student/15 gradient-student">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-display">
            <PlusCircle className="h-5 w-5 text-student" />
            Enroll in a Subject
          </CardTitle>
          <CardDescription>
            Enter the subject code provided by your instructor to enroll.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEnroll} className="flex gap-3">
            <Input
              placeholder="Enter subject code (e.g. CS101)"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              className="flex-1 focus-visible:ring-student uppercase bg-card"
              maxLength={20}
            />
            <Button
              type="submit"
              disabled={enrolling || !subjectCode.trim()}
              className="bg-student text-student-foreground hover:bg-student/90 shadow-sm"
            >
              {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enroll"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Enrolled Subjects List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-foreground">My Subjects</h2>
          <span className="text-xs text-muted-foreground">{enrollments.length} enrolled</span>
        </div>
        {enrollmentsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-student" />
          </div>
        ) : enrollments.length === 0 ? (
          <Card className="border-dashed border-2 border-border shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-xl bg-muted p-4 mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No subjects enrolled yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">Use a subject code from your instructor to enroll above.</p>
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
                  <CardTitle className="text-base text-foreground mt-2 font-display">
                    {enrollment.subjects.name}
                  </CardTitle>
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
    </div>
  );
}
