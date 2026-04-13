import { Outlet, NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Bell,
  BookCopy,
  Building2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Compass,
  Home,
  Menu,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { useAdminUiStore } from "@/store/adminUiStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    currentWorkspace,
    setCurrentWorkspace,
    sidebarCollapsed,
    setSidebarCollapsed,
    sidebarOpen,
    setSidebarOpen,
  } = useAdminUiStore();

  const currentLabel = useMemo(() => {
    const found = navItems.find((item) => location.pathname.startsWith(item.to));
    return found?.label || "Admin";
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNav = (label, closeMobile = false) => {
    setCurrentWorkspace(label.toLowerCase());
    if (closeMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid max-w-full lg:grid-cols-[auto_1fr]">
        <aside className={cn("hidden lg:block", sidebarCollapsed ? "w-[92px]" : "w-72")}>
          <div className="sticky top-0 flex h-screen flex-col border-r border-border/60 bg-card px-3 py-4">
            <div className={cn("mb-5 flex items-center", sidebarCollapsed ? "justify-center" : "justify-between") }>
              {!sidebarCollapsed ? <h2 className="text-base font-semibold">SportsBuddy Admin</h2> : null}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => handleNav(item.label)}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      sidebarCollapsed ? "justify-center" : "justify-between",
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
                        {!sidebarCollapsed ? item.label : null}
                      </span>
                      {!sidebarCollapsed ? (
                        <ChevronRight className={cn("h-4 w-4 opacity-0 transition-all", isActive && "opacity-100")} />
                      ) : null}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <Separator className="my-4" />

            <Link
              to="/"
              className={cn(
                "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
                sidebarCollapsed ? "justify-center" : "gap-2.5"
              )}
            >
              <Home className="h-4 w-4 text-primary/70" />
              {!sidebarCollapsed ? "Back to website" : null}
            </Link>

            <Separator className="my-4" />

            <div className={cn("flex items-center gap-2 px-1", sidebarCollapsed && "justify-center") }>
              <Avatar className="h-8 w-8 border border-border/70">
                <AvatarImage src={user?.avatar?.url} />
                <AvatarFallback>{user?.name?.charAt(0) || "A"}</AvatarFallback>
              </Avatar>
              {!sidebarCollapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user?.name || "Admin"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email || ""}</p>
                </div>
              ) : null}
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[86vw] max-w-xs border-r border-border/60 bg-background p-4">
                    <div className="mb-4">
                      <h2 className="text-base font-semibold">SportsBuddy Admin</h2>
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
                          onClick={() => handleNav(item.label, true)}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </NavLink>
                      ))}
                    </nav>
                    <Separator className="my-4" />
                    <Link
                      to="/"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Home className="h-4 w-4" />
                      Back to website
                    </Link>
                  </SheetContent>
                </Sheet>

                <div>
                  <h1 className="text-lg font-semibold leading-tight lg:text-xl">{currentLabel}</h1>
                  <p className="text-xs text-muted-foreground">Workspace: {currentWorkspace || currentLabel.toLowerCase()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="hidden md:inline-flex" asChild>
                  <Link to="/dashboard">
                    <Home className="mr-1 h-4 w-4" />
                    User Dashboard
                  </Link>
                </Button>
                <ThemeToggle />
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-1 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          <main className="px-4 py-5 lg:px-8 lg:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
