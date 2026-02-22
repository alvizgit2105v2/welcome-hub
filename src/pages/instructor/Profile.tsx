import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Save, Loader2, Mail } from "lucide-react";

export default function InstructorProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setFullName(data.full_name ?? "");
        } else if (error && error.code === "PGRST116") {
          supabase
            .from("profiles")
            .insert({ user_id: user.id, role: "instructor" })
            .then(() => setFullName(""));
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let error;
    if (existingProfile) {
      const result = await supabase
        .from("profiles")
        .update({ full_name: fullName || null })
        .eq("user_id", user.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("profiles")
        .insert({ user_id: user.id, role: "instructor", full_name: fullName || null });
      error = result.error;
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-instructor" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your personal information.
        </p>
      </div>

      <Card className="border-instructor/20">
        <CardHeader>
          <CardTitle className="text-foreground">Personal Information</CardTitle>
          <CardDescription>
            Manage your profile details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="pl-10 bg-muted/50 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your email address cannot be changed.
              </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 focus-visible:ring-instructor"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="bg-instructor text-instructor-foreground hover:bg-instructor/90 min-w-[140px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
