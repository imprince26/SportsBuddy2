import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  Bell,
  BookCopy,
  Building2,
  BarChart3,
  ChevronRight,
  ClipboardList,
  Compass,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import { useAdminUiStore } from "@/store/adminUiStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/events", label: "Events", icon: Compass },
  { to: "/admin/communities", label: "Communities", icon: Activity },
  { to: "/admin/venues", label: "Venues", icon: Building2 },
  { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: BookCopy },
];

const AdminLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { currentWorkspace, setCurrentWorkspace } = useAdminUiStore();

  const currentLabel = useMemo(() => {
    const found = navItems.find((item) => location.pathname.startsWith(item.to));
    return found?.label || "Admin";
  }, [location.pathname]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground">
      <div className="container mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
            <div className="mb-5 px-1">
              <h2 className="text-lg font-semibold text-foreground">SportsBuddy Admin</h2>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setCurrentWorkspace(item.label.toLowerCase())}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-2.5">
                        <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-primary/70")} />
                        {item.label}
                      </span>
                      <ChevronRight className={cn("h-4 w-4 opacity-0 transition-all", isActive && "opacity-100")} />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <Separator className="my-4" />
            <div className="flex items-center gap-2 px-1">
              <Avatar className="h-8 w-8 border border-border/70">
                <AvatarImage src={user?.avatar?.url} />
                <AvatarFallback>{user?.name?.charAt(0) || "A"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.name || "Admin"}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email || ""}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="sticky top-20 z-20 mb-6 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden">
                      <LayoutDashboard className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85vw] max-w-xs border-r border-border/60 bg-card p-4">
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold">SportsBuddy Admin</h2>
                    </div>
                    <nav className="space-y-1">
                      {navItems.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium",
                              isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                            )
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </NavLink>
                      ))}
                    </nav>
                  </SheetContent>
                </Sheet>

                <div>
                  <h1 className="text-xl font-semibold leading-tight">{currentLabel}</h1>
                  <p className="text-xs text-muted-foreground">Workspace: {currentWorkspace}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="mr-1 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
