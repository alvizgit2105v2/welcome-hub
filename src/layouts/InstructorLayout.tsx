import { Navigate, Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { InstructorSidebar } from "@/components/InstructorSidebar";
import { useAuth } from "@/contexts/AuthContext";

export default function InstructorLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-instructor border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?role=instructor" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <InstructorSidebar />
        <main className="flex-1">
          <header className="flex h-14 items-center border-b border-border px-4">
            <SidebarTrigger />
          </header>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
