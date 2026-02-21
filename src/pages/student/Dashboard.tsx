import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, User, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string | null; program: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, [user]);

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
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your Program
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-student" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : profile?.program ? (
                profile.program
              ) : (
                <span className="text-muted-foreground">Not set</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {profile?.program ? "Current program" : "Update in profile"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-student/20 hover:border-student/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Account Status
            </CardTitle>
            <User className="h-4 w-4 text-student" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Active</div>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.email}
            </p>
          </CardContent>
        </Card>

        <Card className="border-student/20 hover:border-student/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quick Actions
            </CardTitle>
            <BookOpen className="h-4 w-4 text-student" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Profile</div>
            <p className="text-xs text-muted-foreground mt-1">
              Manage your information
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Card */}
      <Card className="border-student/30 bg-gradient-to-br from-student/5 to-student/10">
        <CardHeader>
          <CardTitle className="text-foreground">Get Started</CardTitle>
          <CardDescription>
            Complete your profile to get the most out of your student experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {profile?.full_name && profile?.program
                  ? "Profile complete ✓"
                  : "Complete your profile"}
              </p>
              <p className="text-xs text-muted-foreground">
                {profile?.full_name && profile?.program
                  ? "Your profile is up to date"
                  : "Add your name and program to get started"}
              </p>
            </div>
            <button
              onClick={() => navigate("/student/profile")}
              className="rounded-lg bg-student px-4 py-2 text-sm font-semibold text-student-foreground transition-colors hover:bg-student/90"
            >
              {profile?.full_name && profile?.program ? "Edit Profile" : "Complete Profile"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
