import { motion } from "framer-motion";
import { GraduationCap, Presentation } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const roles = [
  {
    id: "student",
    title: "Student",
    description: "Access courses, track progress, and learn at your own pace.",
    icon: GraduationCap,
    colorClass: "border-student/30 hover:border-student/60",
    glowClass: "glow-student",
    iconBg: "bg-student/10",
    iconColor: "text-student",
    buttonClass: "bg-student text-student-foreground hover:bg-student/90",
  },
  {
    id: "instructor",
    title: "Instructor",
    description: "Create courses, manage students, and share your expertise.",
    icon: Presentation,
    colorClass: "border-instructor/30 hover:border-instructor/60",
    glowClass: "glow-instructor",
    iconBg: "bg-instructor/10",
    iconColor: "text-instructor",
    buttonClass: "bg-instructor text-instructor-foreground hover:bg-instructor/90",
  },
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
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex flex-col items-center gap-6 rounded-2xl border bg-card p-8 text-left transition-all duration-300 sm:p-10 ${
        role.colorClass
      } ${isSelected ? role.glowClass : ""} cursor-pointer`}
    >
      <div className={`rounded-2xl p-4 ${role.iconBg}`}>
        <Icon className={`h-10 w-10 ${role.iconColor}`} strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">
          {role.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {role.description}
        </p>
      </div>
      <div
        className={`mt-2 w-full rounded-xl px-6 py-3 text-center text-sm font-semibold transition-colors ${role.buttonClass}`}
      >
        Continue as {role.title}
      </div>
    </motion.button>
  );
};

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="gradient-mesh flex min-h-screen flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-3 inline-block rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground"
        >
          Welcome to the platform
        </motion.div>

        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          How will you learn?
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
          Select your role to get started. You can always change this later.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {roles.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
            >
              <RoleCard
                role={role}
                isSelected={selectedRole === role.id}
                onSelect={() => navigate(`/auth?role=${role.id}`)}
              />
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
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
