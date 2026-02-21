import { useAuth } from "@/contexts/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
        Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}!
      </h1>
      <p className="mt-2 text-muted-foreground">
        Your student dashboard. More features coming soon.
      </p>
    </div>
  );
}
