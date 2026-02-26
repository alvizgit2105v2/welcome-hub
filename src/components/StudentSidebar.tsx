import { User, LogOut, LayoutDashboard, BookOpen, GraduationCap } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const menuItems = [
  { title: "Dashboard", url: "/student", icon: LayoutDashboard },
  { title: "Subjects", url: "/student/subjects", icon: BookOpen },
  { title: "Profile", url: "/student/profile", icon: User },
];

export function StudentSidebar() {
  const { user, signOut } = useAuth();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-student/10">
            <GraduationCap className="h-4.5 w-4.5 text-student" />
          </div>
          <div>
            <p className="text-sm font-display font-bold text-sidebar-foreground">LearnPath</p>
            <p className="text-[10px] font-medium text-student uppercase tracking-wider">Student</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-medium tracking-wide text-[10px] uppercase px-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-all hover:bg-student/8 hover:text-student"
                      activeClassName="bg-student/10 text-student font-medium shadow-sm"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-all hover:bg-destructive/8 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="text-xs max-w-[200px]">
            <p className="font-medium">Signed in as:</p>
            <p className="text-muted-foreground break-all">{user?.email ?? "Unknown account"}</p>
          </TooltipContent>
        </Tooltip>
      </SidebarFooter>
    </Sidebar>
  );
}
