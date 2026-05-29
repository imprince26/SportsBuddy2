import { Outlet, NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Bell,
  BookCopy,
  Building2,
  CalendarDays,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  ShieldCheck,
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
import { ScrollArea } from "@/components/ui/scroll-area";

const navGroups = [
  {
    label: "Dashboard",
    items: [
      { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Manage",
    items: [
      { to: "/admin/users", label: "Users", icon: Users },
      { to: "/admin/events", label: "Events", icon: CalendarDays },
      { to: "/admin/communities", label: "Communities", icon: Activity },
      { to: "/admin/venues", label: "Venues", icon: Building2 },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
      { to: "/admin/event-payments", label: "Event Payments", icon: Receipt },
      { to: "/admin/notifications", label: "Notifications", icon: Bell },
      { to: "/admin/audit-logs", label: "Audit Logs", icon: BookCopy },
    ],
  },
];

const navItems = navGroups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label })));

const AdminNavItem = ({ item, onSelect }) => {
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      onClick={onSelect}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )
      }
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
};

const SidebarContent = ({ mobile = false, onNavigate }) => {
  const websiteItem = { to: "/", label: "Back to Website", icon: Home };

  return (
    <div className={cn("flex h-full min-h-0 flex-col", mobile ? "p-4" : null)}>
      <div
        className={cn(
          "flex items-center gap-3",
          "justify-start px-2",
          mobile ? "pr-10" : null
        )}
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">SportsBuddy</p>
          <p className="truncate text-xs text-muted-foreground">Admin Console</p>
        </div>
      </div>

      <Separator className="my-4" />

      <ScrollArea className="min-h-0 flex-1 pr-2">
        <nav className="flex flex-col gap-4">
          {navGroups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              {group.items.map((item) => (
                <AdminNavItem
                  key={item.to}
                  item={item}
                  onSelect={() => onNavigate(item.label)}
                />
              ))}
            </div>
          ))}
        </nav>
      </ScrollArea>

      <Separator className="my-4" />

      <AdminNavItem item={websiteItem} onSelect={() => onNavigate("Website")} />
    </div>
  );
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentWorkspace, setCurrentWorkspace, sidebarOpen, setSidebarOpen } = useAdminUiStore();

  const currentNav = useMemo(() => {
    return navItems.find((item) => location.pathname.startsWith(item.to)) || navItems[0];
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNav = (label, closeMobile = false) => {
    setCurrentWorkspace(label);
    if (closeMobile) setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen max-w-full lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden border-r border-border/60 bg-white dark:bg-background lg:block">
            <div className="sticky top-0 flex h-screen min-h-0 flex-col p-4">
              <SidebarContent onNavigate={handleNav} />
            </div>
          </aside>

          <div className="min-w-0">
            <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[86vw] max-w-xs border-r border-border/60 bg-white p-0 dark:bg-background">
                      <SidebarContent mobile onNavigate={(label) => handleNav(label, true)} />
                    </SheetContent>
                  </Sheet>

                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border/60 bg-card text-primary">
                    <currentNav.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="truncate text-lg font-semibold leading-tight">{currentNav.label}</h1>
                    <p className="truncate text-xs text-muted-foreground">
                      {currentNav.group} / {currentWorkspace || currentNav.label}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="outline" size="sm" className="hidden md:inline-flex" asChild>
                    <Link to="/dashboard">
                      <Home className="mr-1 h-4 w-4" />
                      User Dashboard
                    </Link>
                  </Button>
                  <ThemeToggle />
                  <div className="hidden items-center gap-2 rounded-lg border border-border/60 bg-card px-2 py-1.5 lg:flex">
                    <Avatar className="h-7 w-7 border border-border/70">
                      <AvatarImage src={user?.avatar?.url} />
                      <AvatarFallback>{user?.name?.charAt(0) || "A"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="max-w-[140px] truncate text-xs font-semibold">{user?.name || "Admin"}</p>
                      <p className="max-w-[140px] truncate text-[11px] text-muted-foreground">Administrator</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-1 h-4 w-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </div>
              </div>
            </header>

            <main className="min-w-0 px-4 py-5 lg:px-6 lg:py-6">
              <div className="mx-auto w-full max-w-[1680px]">
                <Outlet />
              </div>
            </main>
          </div>
      </div>
    </div>
  );
};

export default AdminLayout;
