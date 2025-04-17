"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Users, Calendar, Bell, Settings, LogOut, Menu, X, ChevronLeft, Shield, Home, BarChart } from "lucide-react"

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const sidebarLinks = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <BarChart size={20} />,
    },
    {
      name: "Manage Users",
      path: "/admin/users",
      icon: <Users size={20} />,
    },
    {
      name: "Manage Events",
      path: "/admin/events",
      icon: <Calendar size={20} />,
    },
    {
      name: "Manage Notifications",
      path: "/admin/notifications",
      icon: <Bell size={20} />,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Settings size={20} />,
    },
  ]

  if (!user || user.role !== "admin") {
    return <div>{children}</div>
  }

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark">
      {/* Sidebar for desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out md:relative md:flex`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
            <Link to="/admin/dashboard" className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-primary-light dark:text-primary-dark" />
              <span className="text-lg font-bold text-foreground-light dark:text-foreground-dark">Admin Panel</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-md text-muted-foreground-light dark:text-muted-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              <Link
                to="/dashboard"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
              >
                <Home size={20} className="mr-3" />
                Back to App
              </Link>

              <div className="pt-4 pb-2">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <span className="inline-block h-8 w-8 rounded-full overflow-hidden bg-muted-light dark:bg-muted-dark">
                      {user?.avatar ? (
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <span className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
                            {user?.name?.charAt(0).toUpperCase() || "A"}
                          </span>
                        </div>
                      )}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-foreground-light dark:text-foreground-dark">{user?.name}</p>
                    <p className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">Admin</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-border-light dark:border-border-dark pt-4">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                      location.pathname === link.path
                        ? "bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark"
                        : "text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                    }`}
                  >
                    <span className="mr-3">{link.icon}</span>
                    {link.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          <div className="p-4 border-t border-border-light dark:border-border-dark">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium rounded-md text-destructive-light dark:text-destructive-dark hover:bg-muted-light dark:hover:bg-muted-dark"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMobileSidebarOpen(false)}></div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <div className="bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2 rounded-md text-muted-foreground-light dark:text-muted-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark md:hidden"
              >
                <Menu size={20} />
              </button>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md text-muted-foreground-light dark:text-muted-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark hidden md:block"
              >
                <ChevronLeft
                  size={20}
                  className={`transform transition-transform ${isSidebarOpen ? "" : "rotate-180"}`}
                />
              </button>
            </div>
            <div className="flex items-center">
              <Link
                to="/admin/notifications"
                className="p-2 rounded-md text-muted-foreground-light dark:text-muted-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark relative"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive-light dark:bg-destructive-dark rounded-full"></span>
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout
