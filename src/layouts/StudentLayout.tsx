import { Navigate, Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/StudentSidebar";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-student border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?role=student" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <StudentSidebar />
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center border-b border-border bg-card/80 backdrop-blur-sm px-6">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground hidden sm:block">Student Portal</span>
              <div className="h-2 w-2 rounded-full bg-student animate-pulse" />
            </div>
          </header>
          <div className="flex-1 p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
