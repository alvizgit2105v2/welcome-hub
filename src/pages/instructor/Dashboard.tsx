import { Presentation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InstructorDashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Instructor Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome to your instructor portal.
        </p>
      </div>

      <Card className="border-instructor/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Presentation className="h-5 w-5 text-instructor" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your instructor dashboard is ready. Use the sidebar to manage your profile.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
