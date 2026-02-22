import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, User, PlusCircle, Loader2 } from "lucide-react";
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
    const { data, error } = await supabase
      .from("enrollments")
      .select("id, subject_id, enrolled_at, subjects(id, subject_code, name, description)")
      .eq("student_id", user.id)
      .order("enrolled_at", { ascending: false });

    if (data) {
      setEnrollments(data as unknown as EnrolledSubject[]);
    }
    setEnrollmentsLoading(false);
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subjectCode.trim()) return;
    setEnrolling(true);

    // Look up subject by code
    const { data: subject, error: lookupError } = await supabase
      .from("subjects")
      .select("id, name")
      .eq("subject_code", subjectCode.trim().toUpperCase())
      .single();

    if (lookupError || !subject) {
      toast({
        title: "Subject not found",
        description: "No subject matches that code. Please check with your instructor.",
        variant: "destructive",
      });
      setEnrolling(false);
      return;
    }

    // Enroll
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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {displayName}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Here's an overview of your student dashboard.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-student/20 hover:border-student/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Your Program</CardTitle>
            <GraduationCap className="h-4 w-4 text-student" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? <span className="text-muted-foreground">Loading...</span> : profile?.program || <span className="text-muted-foreground">Not set</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {profile?.program ? "Current program" : "Update in profile"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-student/20 hover:border-student/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-student" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{enrollments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active subjects</p>
          </CardContent>
        </Card>

        <Card className="border-student/20 hover:border-student/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Account Status</CardTitle>
            <User className="h-4 w-4 text-student" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Active</div>
            <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
          </CardContent>
        </Card>
      </div>

      {/* Enroll Subject Card */}
      <Card className="border-student/30 bg-gradient-to-br from-student/5 to-student/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
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
              className="flex-1 focus-visible:ring-student uppercase"
              maxLength={20}
            />
            <Button
              type="submit"
              disabled={enrolling || !subjectCode.trim()}
              className="bg-student text-student-foreground hover:bg-student/90"
            >
              {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enroll"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Enrolled Subjects List */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">My Subjects</h2>
        {enrollmentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-student" />
          </div>
        ) : enrollments.length === 0 ? (
          <Card className="border-dashed border-student/20">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No subjects enrolled yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Use a subject code from your instructor to enroll above.</p>
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
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-student bg-student/10 px-2 py-0.5 rounded">
                      {enrollment.subjects.subject_code}
                    </span>
                  </div>
                  <CardTitle className="text-lg text-foreground mt-2">
                    {enrollment.subjects.name}
                  </CardTitle>
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
    </div>
  );
}
