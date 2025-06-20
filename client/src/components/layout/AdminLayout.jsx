"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BarChart3, Users, Calendar, Bell, Settings, Search, LogOut, Menu, Home, Shield, MessageSquare, TrendingUp, Activity, ChevronLeft, Sun, Moon } from 'lucide-react'

const AdminLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Mock user data - replace with actual auth context
  const user = {
    name: "Admin User",
    email: "admin@sportsbuddy.com",
    avatar: "/placeholder.svg",
    role: "admin"
  }

  const sidebarLinks = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: BarChart3,
      badge: null
    },
    {
      name: "Manage Users",
      path: "/admin/users",
      icon: Users,
      badge: "1.2k"
    },
    {
      name: "Manage Events",
      path: "/admin/events",
      icon: Calendar,
      badge: "45"
    },
    {
      name: "Notifications",
      path: "/admin/notifications",
      icon: Bell,
      badge: "3"
    },
    {
      name: "Messages",
      path: "/admin/messages",
      icon: MessageSquare,
      badge: null
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: TrendingUp,
      badge: null
    },
    {
      name: "Search",
      path: "/admin/search",
      icon: Search,
      badge: null
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: Settings,
      badge: null
    }
  ]

  const handleLogout = () => {
    // Implement logout logic
    navigate("/login")
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <Link to="/admin/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">SportsBuddy</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-card-light dark:bg-card-dark">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Admin
          </Badge>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="mb-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => navigate("/dashboard")}
          >
            <Home className="w-4 h-4 mr-3" />
            Back to App
          </Button>
        </div>
        
        <Separator className="my-4" />
        
        {sidebarLinks.map((link) => {
          const isActive = location.pathname === link.path
          const Icon = link.icon
          
          return (
            <Link key={link.path} to={link.path}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  isActive 
                    ? "bg-card-light dark:bg-card-dark text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                <span className="flex-1 text-left">{link.name}</span>
                {link.badge && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    {link.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={toggleTheme}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 mr-3" />
          ) : (
            <Moon className="w-4 h-4 mr-3" />
          )}
          Toggle Theme
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col bg-card-light dark:bg-card-dark border-r border-border transition-all duration-300 ${
        isSidebarOpen ? "w-64" : "w-16"
      }`}>
        {isSidebarOpen ? (
          <SidebarContent />
        ) : (
          <div className="flex flex-col items-center py-6 space-y-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-5 h-5" />
            </Button>
            {sidebarLinks.slice(0, 6).map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path
              
              return (
                <Link key={link.path} to={link.path}>
                  <Button
                    variant={ "ghost"}
                    size="icon"
                    className={isActive ? "bg-background-light dark:bg-background-dark" : ""}
                  >
                    <Icon className="w-5 h-5" />
                  </Button>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card-light dark:bg-card-dark border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-card-light dark:bg-card-dark">
                  <SidebarContent />
                </SheetContent>
              </Sheet>

              {/* Desktop Sidebar Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex"
              >
                <ChevronLeft className={`w-5 h-5 transition-transform ${
                  isSidebarOpen ? "" : "rotate-180"
                }`} />
              </Button>

              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {sidebarLinks.find(link => link.path === location.pathname)?.name || "Admin Panel"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your SportsBuddy platform
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  3
                </Badge>
              </Button>
              
              <Button variant="ghost" size="icon">
                <Activity className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
