import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GraduationCap, Presentation, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "signin" | "signup";

const roleConfig = {
  student: {
    icon: GraduationCap,
    label: "Student",
    accent: "student",
    btnClass: "bg-student text-student-foreground hover:bg-student/90",
    inputRing: "focus-visible:ring-student",
    glowClass: "glow-student",
    borderClass: "border-student/30",
  },
  instructor: {
    icon: Presentation,
    label: "Instructor",
    accent: "instructor",
    btnClass: "bg-instructor text-instructor-foreground hover:bg-instructor/90",
    inputRing: "focus-visible:ring-instructor",
    glowClass: "glow-instructor",
    borderClass: "border-instructor/30",
  },
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const role = (searchParams.get("role") as "student" | "instructor") || "student";
  const config = roleConfig[role];
  const Icon = config.icon;

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;

        if (data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({ user_id: data.user.id, role, full_name: fullName || null });
          if (profileError) throw profileError;
        }

        toast({
          title: "Account created!",
          description: "Check your email to verify your account.",
        });
        navigate(role === "instructor" ? "/" : "/student");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(role === "instructor" ? "/" : "/student");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-mesh flex min-h-screen flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to role selection
        </button>

        {/* Card */}
        <div className={`rounded-2xl border bg-card p-8 ${config.borderClass} ${config.glowClass}`}>
          {/* Header */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className={`rounded-2xl p-3 bg-${config.accent}/10`}>
              <Icon className={`h-8 w-8 text-${config.accent}`} strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                {mode === "signin" ? "Welcome back" : "Create account"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "signin"
                  ? `Sign in as ${config.label}`
                  : `Sign up as ${config.label}`}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`pl-10 ${config.inputRing}`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`pl-10 ${config.inputRing}`}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={`pl-10 pr-10 ${config.inputRing}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl py-3 text-sm font-semibold ${config.btnClass}`}
            >
              {loading
                ? "Please wait..."
                : mode === "signin"
                ? "Sign In"
                : "Create Account"}
            </Button>
          </form>

          {/* Toggle mode */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className={`font-medium text-${config.accent} underline-offset-4 hover:underline`}
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
