import { motion } from "framer-motion";
import { GraduationCap, Presentation, ArrowRight, BookOpen, Users, BarChart3 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const roles = [
  {
    id: "student",
    title: "Student",
    description: "Access courses, track progress, and manage your learning journey.",
    icon: GraduationCap,
    colorClass: "border-student/20 hover:border-student/40 hover:shadow-elevated",
    glowClass: "glow-student",
    iconBg: "bg-student/10",
    iconColor: "text-student",
    buttonClass: "bg-student text-student-foreground hover:bg-student/90",
  },
  {
    id: "instructor",
    title: "Instructor",
    description: "Create courses, manage students, and track academic performance.",
    icon: Presentation,
    colorClass: "border-instructor/20 hover:border-instructor/40 hover:shadow-elevated",
    glowClass: "glow-instructor",
    iconBg: "bg-instructor/10",
    iconColor: "text-instructor",
    buttonClass: "bg-instructor text-instructor-foreground hover:bg-instructor/90",
  },
];

const features = [
  { icon: BookOpen, title: "Course Management", description: "Organize subjects, programs, and curriculum effortlessly" },
  { icon: Users, title: "Attendance Tracking", description: "Real-time attendance monitoring with detailed summaries" },
  { icon: BarChart3, title: "Performance Insights", description: "Track grades, assignments, and academic progress" },
];

const RoleCard = ({
  role,
  isSelected,
  onSelect,
}: {
  role: (typeof roles)[0];
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const Icon = role.icon;

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex flex-col items-center gap-5 rounded-2xl border bg-card p-8 text-left transition-all duration-300 shadow-card sm:p-10 ${
        role.colorClass
      } ${isSelected ? role.glowClass : ""} cursor-pointer`}
    >
      <div className={`rounded-xl p-4 ${role.iconBg}`}>
        <Icon className={`h-8 w-8 ${role.iconColor}`} strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
          {role.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {role.description}
        </p>
      </div>
      <div
        className={`mt-1 w-full rounded-xl px-6 py-3 text-center text-sm font-semibold transition-all flex items-center justify-center gap-2 ${role.buttonClass}`}
      >
        Continue as {role.title}
        <ArrowRight className="h-4 w-4" />
      </div>
    </motion.button>
  );
};

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="gradient-mesh flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-3xl text-center"
      >
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground shadow-soft"
        >
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          LearnPath Platform
        </motion.div>

        <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Your learning,{" "}
          <span className="bg-gradient-to-r from-[hsl(var(--student))] to-[hsl(var(--instructor))] bg-clip-text text-transparent">
            simplified
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground leading-relaxed">
          A modern platform for managing courses, tracking attendance, and staying on top of your academic journey.
        </p>

        {/* Role Selection */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {roles.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
            >
              <RoleCard
                role={role}
                isSelected={selectedRole === role.id}
                onSelect={() => navigate(`/auth?role=${role.id}`)}
              />
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {features.map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-lg bg-muted p-2.5">
                <f.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">{f.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </motion.div>

        <p className="mt-10 text-xs text-muted-foreground">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/auth?role=student")}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Index;
