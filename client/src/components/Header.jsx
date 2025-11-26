import { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import {
  Menu,
  X,
  Home,
  Calendar,
  User,
  Bell,
  LogOut,
  ChevronDown,
  Search,
  Moon,
  Sun,
  Shield,
  Users,
  Settings,
  PlusCircle,
  Activity,
  MapPin,
  Trophy,
  CalendarCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
      )
    }
    return false
  })
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const profileMenuRef = useRef(null)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false)
    setIsProfileMenuOpen(false)
  }, [location.pathname])

  // Theme management
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDarkMode])

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMenuOpen])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleLogout = async () => {
    try {
      setIsProfileMenuOpen(false)
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const unreadNotifications = user?.notifications?.filter((n) => !n.read)?.length || 0

  // Navigation links
  const navigationLinks = [
    {
      name: "Home",
      path: "/",
      icon: Home,
      description: "Back to homepage",
    },
    {
      name: "Events",
      path: "/events",
      icon: Calendar,
      description: "Browse sports events",
    },
    { name: "Venues", icon: MapPin, path: "/venues" },
    { name: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    { name: "Athletes", icon: Search, path: "/athletes" },
    // ...(isAuthenticated
    //   ? [
    //     {
    //       name: "Dashboard",
    //       path: "/dashboard",
    //       icon: Activity,
    //       description: "Your personal dashboard",
    //     },
    //   ]
    //   : []),
    {
      name: "Community",
      path: "/community",
      icon: Users,
      description: "Connect with athletes",
    },
  ]

  // Quick actions for authenticated users
  const quickActions = [
    {
      name: "Create Event",
      path: "/events/create",
      icon: PlusCircle,
    },
    {
      name: "Search",
      path: "/search",
      icon: Search,
    },
  ]

  return (
    <>
      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled ? "glass shadow-sm py-2" : "bg-transparent border-transparent py-4",
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <div className="flex-shrink-0 mr-2">
              <Link to="/" className="flex items-center group">
                <span className="text-2xl font-bold font-serif tracking-tight text-foreground group-hover:text-primary transition-colors">
                  SportsBuddy
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 bg-secondary/50 backdrop-blur-sm px-2 py-1 rounded-full border border-border/50">
              {navigationLinks.map((link) => {
                const isActive =
                  location.pathname === link.path || (link.path !== "/" && location.pathname.startsWith(link.path))

                return (
                  <Link key={link.path} to={link.path}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "h-9 px-4 text-sm font-medium rounded-full transition-all duration-300",
                        isActive
                          ? "bg-background text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                      )}
                    >
                      {link.name}
                    </Button>
                  </Link>
                )
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Quick Actions (Desktop) */}
              {isAuthenticated && (
                <div className="hidden xl:flex items-center gap-2 mr-2">
                  {quickActions.map((action) => (
                    <Tooltip>
                      <TooltipTrigger>
                        <Link key={action.path} to={action.path}>
                          <Button variant="outline" size="sm" className="h-9 gap-2 bg-transparent">
                            <action.icon className="w-4 h-4" />
                            <span className="hidden 2xl:inline">{action.name}</span>
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{action.name}</p>
                      </TooltipContent>
                    </Tooltip>

                  ))}
                </div>
              )}

              {/* Theme Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle theme</p>
                </TooltipContent>
              </Tooltip>

              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <Tooltip>
                    <TooltipTrigger>
                      <Link to="/notifications">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary"
                        >
                          <Bell className="w-5 h-5" />
                          {unreadNotifications > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full ring-2 ring-background" />
                          )}
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notifications</p>
                    </TooltipContent>
                  </Tooltip>


                  {/* Profile Menu (Desktop) */}
                  <div className="relative hidden md:block" ref={profileMenuRef}>
                    <Button
                      variant="ghost"
                      className="gap-2 pl-2 pr-3 h-10 rounded-full hover:bg-secondary border border-transparent hover:border-border"
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    >
                      <Avatar className="w-8 h-8 border-2 border-background shadow-sm">
                        <AvatarImage src={user?.avatar?.url} />
                        <AvatarFallback className="text-lg bg-primary/10 text-primary">
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
                        {user?.name || "User"}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform",
                          isProfileMenuOpen && "rotate-180",
                        )}
                      />
                    </Button>

                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-popover/95 backdrop-blur-xl text-popover-foreground rounded-2xl shadow-xl border border-border/50 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-2">
                          <div className="px-3 py-2 mb-1 bg-secondary/50 rounded-xl">
                            <p className="text-sm font-semibold leading-none">{user?.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
                          </div>
                          <div className="h-px bg-border/50 my-1" />

                          {[
                            { icon: User, label: "Profile", path: "/profile" },
                            { icon: Activity, label: "Dashboard", path: "/dashboard" },
                            // { icon: MapPin, label: "Venues", path: "/venues" },
                            // { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
                            { icon: CalendarCheck, label: "My Bookings", path: "/my-bookings" },
                            // { icon: Search, label: "Athletes", path: "/athletes" },
                            { icon: Settings, label: "Settings", path: "/settings" },
                          ].map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              <item.icon className="w-4 h-4" />
                              {item.label}
                            </Link>
                          ))}

                          {user?.role === "admin" && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-primary font-medium"
                            >
                              <Shield className="w-4 h-4" />
                              Admin Panel
                            </Link>
                          )}

                          <div className="h-px bg-border/50 my-1" />

                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 hover:text-red-500 transition-colors text-red-500"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Auth Buttons */
                <div className="hidden md:flex items-center gap-3">
                  <Link to="/login">
                    <Button variant="ghost" className="font-medium text-muted-foreground hover:text-foreground">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="rounded-full px-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 bg-primary hover:bg-primary/90">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden">
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Sidebar */}
          <div className="lg:hidden fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
              <span className="text-lg font-semibold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-4 py-4 space-y-4">
                {/* Navigation Links */}
                <div className="space-y-1">
                  <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Navigation
                  </p>
                  {navigationLinks.map((link) => {
                    const isActive = location.pathname === link.path
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <link.icon className="w-5 h-5" />
                        {link.name}
                      </Link>
                    )
                  })}
                </div>

                {isAuthenticated ? (
                  <>
                    <div className="h-px bg-border" />

                    {/* Quick Actions */}
                    <div className="space-y-1">
                      <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Quick Actions
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {quickActions.map((action) => (
                          <Link key={action.path} to={action.path} onClick={() => setIsMenuOpen(false)}>
                            <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" size="sm">
                              <action.icon className="w-4 h-4" />
                              {action.name}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Account Links */}
                    <div className="space-y-1">
                      <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Account
                      </p>
                      {[
                        { icon: User, label: "Profile", path: "/profile" },
                        { icon: Activity, label: "Dashboard", path: "/dashboard" },
                        { icon: CalendarCheck, label: "My Bookings", path: "/my-bookings" },
                        { icon: Settings, label: "Settings", path: "/settings" },
                        ...(user?.role === "admin"
                          ? [{ icon: Shield, label: "Admin Panel", path: "/admin/dashboard" }]
                          : []),
                      ].map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 pt-4 border-t border-border">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full bg-transparent">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full mt-2">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </ScrollArea>

            {isAuthenticated && (
              <div className="shrink-0 border-t border-border p-4 bg-background">
                <div className="flex items-center gap-3 mb-3 px-2">
                  <Avatar className="w-10 h-10 border-2 border-primary/20">
                    <AvatarImage src={user?.avatar?.url} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default Header
