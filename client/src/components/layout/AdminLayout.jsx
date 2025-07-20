import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Bell, 
  Settings, 
  Search, 
  LogOut, 
  Menu, 
  Home, 
  Shield, 
  MessageSquare, 
  TrendingUp, 
  ChevronLeft, 
  Sun, 
  Moon,
  ChevronDown,
  Command,
  Sparkles,
  HelpCircle,
  User,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

const AdminLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [notifications, setNotifications] = useState(3)
  

  const sidebarSections = [
    {
      name: "Overview",
      links: [
        {
          name: "Dashboard",
          path: "/admin/dashboard",
          icon: BarChart3,
          badge: null,
          description: "Analytics & insights"
        }
      ]
    },
    {
      name: "Management",
      links: [
        {
          name: "Users",
          path: "/admin/users",
          icon: Users,
          badge: "1.2k",
          description: "Manage user accounts"
        },
        {
          name: "Events",
          path: "/admin/events",
          icon: Calendar,
          badge: "45",
          description: "Event management"
        },
        {
          name: "Analytics",
          path: "/admin/analytics",
          icon: TrendingUp,
          badge: null,
          description: "Platform analytics"
        }
      ]
    },
    {
      name: "Communication",
      links: [
        {
          name: "Notifications",
          path: "/admin/notifications",
          icon: Bell,
          badge: "3",
          description: "Send notifications"
        },
        {
          name: "Messages",
          path: "/admin/messages",
          icon: MessageSquare,
          badge: null,
          description: "Direct messaging"
        }
      ]
    },
    {
      name: "Tools",
      links: [
        {
          name: "Search",
          path: "/admin/search",
          icon: Search,
          badge: null,
          description: "Advanced search"
        },
        {
          name: "Settings",
          path: "/admin/settings",
          icon: Settings,
          badge: null,
          description: "System settings"
        }
      ]
    }
  ]

  // Quick actions for header
  const quickActions = [
    { icon: Sparkles, tooltip: "What's New", action: () => console.log("What's New clicked") },
    { icon: HelpCircle, tooltip: "Help & Support", action: () => console.log("Help clicked") },
    { icon: Command, tooltip: "Command Palette", action: () => console.log("Command clicked") }
  ]

  // Theme management
  useEffect(() => {
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  // Fullscreen management
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest('[data-profile-menu]')) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isProfileMenuOpen])

  const handleLogout = async () => {
    try {
      setIsProfileMenuOpen(false)
      await logout()
      navigate("/login")
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const handleProfileSettings = () => {
    setIsProfileMenuOpen(false)
    navigate('/admin/profile')
  }

  const getCurrentPageInfo = () => {
    const allLinks = sidebarSections.flatMap(section => section.links)
    const currentLink = allLinks.find(link => link.path === location.pathname)
    return currentLink || { name: "Admin Panel", description: "Manage your SportsBuddy platform" }
  }

  // Animated sidebar content
  const SidebarContent = ({ isMobile = false, onClose }) => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-r border-gray-200/20 dark:border-gray-700/20"
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200/20 dark:border-gray-700/20">
        <Link to="/admin/dashboard" className="flex items-center space-x-3 group">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="relative w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg"
          >
            <Shield className="w-6 h-6 text-white" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl blur-xl group-hover:blur-lg transition-all duration-300" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              SportsBuddy
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Admin Console
            </span>
          </div>
        </Link>
        {isMobile && onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-gray-200/20 dark:border-gray-700/20">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-12 h-12 ring-2 ring-white/20 dark:ring-gray-700/20">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'AD'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user?.name || 'Admin User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email || 'admin@sportsbuddy.com'}
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
            Admin
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/20">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 border border-blue-200/20 dark:border-blue-700/20">
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Users</div>
            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">1.2k</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3 border border-purple-200/20 dark:border-purple-700/20">
            <div className="text-xs font-medium text-purple-600 dark:text-purple-400">Events</div>
            <div className="text-lg font-bold text-purple-900 dark:text-purple-100">45</div>
          </div>
        </div>
      </div>

      {/* Navigation - Fixed with ScrollArea */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Back to App */}
          <motion.div whileHover={{ x: 4 }}>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
              onClick={() => navigate("/dashboard")}
            >
              <Home className="w-4 h-4 mr-3" />
              <span className="font-medium">Back to App</span>
            </Button>
          </motion.div>
          
          <Separator className="bg-gray-200/50 dark:bg-gray-700/50" />
          
          {/* Navigation Sections */}
          {sidebarSections.map((section, sectionIndex) => (
            <motion.div 
              key={section.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="space-y-2"
            >
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2">
                {section.name}
              </h3>
              {section.links.map((link) => {
                const isActive = location.pathname === link.path
                const Icon = link.icon
                
                return (
                  <motion.div
                    key={link.path}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link to={link.path} onClick={isMobile ? onClose : undefined}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start group rounded-lg transition-all duration-200 h-auto p-3",
                          isActive 
                            ? "bg-primary/10 text-primary border border-primary/20 shadow-sm hover:bg-primary/15" 
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        <div className="flex items-center w-full">
                          <Icon className={cn(
                            "w-4 h-4 mr-3 transition-all duration-200",
                            isActive ? "text-primary" : "group-hover:scale-110"
                          )} />
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm">{link.name}</div>
                            {!isSidebarOpen && !isMobile && (
                              <div className="text-xs opacity-70">{link.description}</div>
                            )}
                          </div>
                          {link.badge && (
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "ml-auto text-xs h-5 px-2",
                                isActive 
                                  ? "bg-primary/10 text-primary border-primary/20"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                              )}
                            >
                              {link.badge}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200/20 dark:border-gray-700/20 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          onClick={toggleTheme}
        >
          <motion.div
            animate={{ rotate: isDarkMode ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 mr-3" />
            ) : (
              <Moon className="w-4 h-4 mr-3" />
            )}
          </motion.div>
          <span className="font-medium">
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          <span className="font-medium">Sign Out</span>
        </Button>
      </div>
    </motion.div>
  )

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Desktop Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="hidden lg:flex flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/20 dark:border-gray-700/20 shadow-xl"
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Sidebar */}
      {!isSidebarOpen && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 72 }}
          className="hidden lg:flex flex-col items-center py-6 space-y-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/20 dark:border-gray-700/20 shadow-xl"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <Separator className="w-8 bg-gray-200/50 dark:bg-gray-700/50" />
          
          <ScrollArea className="flex-1 w-full">
            <div className="flex flex-col items-center space-y-2 px-2">
              {sidebarSections.slice(0, 2).flatMap(section => section.links).map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.path
                
                return (
                  <motion.div key={link.path} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to={link.path}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "rounded-lg transition-all duration-200",
                          isActive 
                            ? "bg-primary/10 text-primary shadow-lg border border-primary/20" 
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </Button>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </ScrollArea>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Bar */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-700/20 shadow-sm px-6 py-4 relative z-10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
                  <SidebarContent isMobile={true} onClose={() => {}} />
                </SheetContent>
              </Sheet>

              {/* Desktop Sidebar Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <motion.div
                  animate={{ rotate: isSidebarOpen ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.div>
              </Button>

              {/* Page Info */}
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {getCurrentPageInfo().name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getCurrentPageInfo().description}
                </p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Quick Actions */}
              <div className="hidden sm:flex items-center space-x-1">
                {quickActions.map((action, index) => (
                  <motion.div key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={action.action}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      title={action.tooltip}
                    >
                      <action.icon className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>

              <Separator orientation="vertical" className="h-6 bg-gray-200/50 dark:bg-gray-700/50" />

              {/* Fullscreen Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="hidden sm:flex text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>

              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                  >
                    {notifications}
                  </motion.div>
                )}
              </Button>
              
              {/* Profile Menu - Fixed */}
              <div className="relative" data-profile-menu>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-3"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                      {user?.name?.split(' ').map(n => n[0]).join('') || 'AD'}
                    </AvatarFallback>
                  </Avatar>
                  {/* <motion.div
                    animate={{ rotate: isProfileMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div> */}
                </Button>
{/* 
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 backdrop-blur-xl overflow-hidden z-[100]"
                      data-profile-menu
                    >
                      <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/20">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                              {user?.name?.split(' ').map(n => n[0]).join('') || 'AD'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {user?.name || 'Admin User'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user?.email || 'admin@sportsbuddy.com'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-800" 
                          onClick={handleProfileSettings}
                        >
                          <User className="w-4 h-4 mr-3" />
                          Profile Settings
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-800" 
                          onClick={() => {
                            toggleTheme()
                            setIsProfileMenuOpen(false)
                          }}
                        >
                          {isDarkMode ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />}
                          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </Button>
                        <Separator className="my-2" />
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" 
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence> */}
              </div>
            </div>
          </div>
        </motion.header>

        {/* Page Content - Fixed with ScrollArea */}
        <ScrollArea className="flex-1 bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80">
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="min-h-full"
            >
              {children || <Outlet />}
            </motion.div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default AdminLayout