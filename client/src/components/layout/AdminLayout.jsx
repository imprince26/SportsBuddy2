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
  Menu,
  Users,
  X,
} from "lucide-react";
import { useAdminUiStore } from "@/store/adminUiStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

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
  const { user } = useAuth();
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useAdminUiStore();

  const currentLabel = useMemo(() => {
    const found = navItems.find((item) => location.pathname.startsWith(item.to));
    return found?.label || "Admin";
  }, [location.pathname]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground">
      <div className="container mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 lg:px-8">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 border-r border-border/70 bg-card p-4 transition-transform duration-300 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:translate-x-0 lg:rounded-2xl lg:border lg:shadow-sm",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="mb-5 flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg font-semibold text-foreground">SportsBuddy Admin</h2>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="flex items-center gap-2.5">
                      <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-primary/70")} />
                      {item.label}
                    </span>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 opacity-0 transition-all group-hover:opacity-100",
                        isActive && "opacity-100"
                      )}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 rounded-xl border border-border/60 bg-secondary/35 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Signed in as</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">{user?.name || "Admin"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
              </div>
            </div>
          </div>
        </aside>

        {sidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="sticky top-20 z-20 mb-6 flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="lg:hidden" onClick={toggleSidebar}>
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold leading-tight">{currentLabel}</h1>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">Manage platform operations and moderation workflows.</p>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
