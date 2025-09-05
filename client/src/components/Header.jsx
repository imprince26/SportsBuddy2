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
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  const [searchFocused, setSearchFocused] = useState(false)
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
      description: "Back to homepage"
    },
    {
      name: "Events",
      path: "/events",
      icon: Calendar,
      description: "Browse sports events"
    },
    ...(isAuthenticated ? [{
      name: "Dashboard",
      path: "/dashboard",
      icon: Activity,
      description: "Your personal dashboard"
    }] : []),
    {
      name: "Community",
      path: "/community",
      icon: Users,
      description: "Connect with athletes"
    },
  ]

  // Quick actions for authenticated users
  const quickActions = [
    {
      name: "Create Event",
      path: "/events/create",
      icon: PlusCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10 hover:bg-green-500/20"
    },
    {
      name: "Find Players",
      path: "/players",
      icon: Search,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10 hover:bg-blue-500/20"
    },
  ]

  // Animation variants
  const menuVariants = {
    closed: { opacity: 0, y: -10, scale: 0.95 },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  }

  const mobileMenuVariants = {
    closed: { opacity: 0, height: 0 },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  }

  const itemVariants = {
    closed: { opacity: 0, x: -10 },
    open: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 }
    }
  }

  return (
    <>
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${isScrolled
            ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/20 dark:border-gray-700/20"
            : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm"
          }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6 lg:w-7 lg:h-7 text-white"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m4.93 4.93 4.24 4.24" />
                      <path d="m14.83 9.17 4.24-4.24" />
                      <path d="m14.83 14.83 4.24 4.24" />
                      <path d="m9.17 14.83-4.24 4.24" />
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    SportsBuddy
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium -mt-1">
                    Find Your Game
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationLinks.map((link, index) => {
                const Icon = link.icon
                const isActive = location.pathname === link.path ||
                  (link.path !== "/" && location.pathname.startsWith(link.path))

                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={link.path} className="group relative">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${isActive
                            ? "bg-blue-600 text-white shadow-lg"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{link.name}</span>
                      </motion.div>

                      {/* Tooltip */}
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        whileHover={{ opacity: 1, y: 0, scale: 1 }}
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"
                      >
                        {link.description}
                      </motion.div>
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Quick Actions (Desktop) */}
              {isAuthenticated && (
                <div className="hidden xl:flex items-center space-x-2">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                      <motion.div
                        key={action.path}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <Link to={action.path}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${action.color} ${action.bgColor}`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="hidden 2xl:inline">{action.name}</span>
                          </motion.button>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Search Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:block"
              >
                <button
                  onClick={() => navigate("/events")}
                  className="p-2 lg:p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                  aria-label="Search events"
                >
                  <Search className="w-5 h-5" />
                </button>
              </motion.div>

              {/* Theme Toggle */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={toggleTheme}
                  className="p-2 lg:p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                  aria-label="Toggle theme"
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: isDarkMode ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </motion.div>
                </button>
              </motion.div>

              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="hidden md:block"
                  >
                    <Link
                      to="/notifications"
                      className="relative h-10 p-2 lg:p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadNotifications > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-6 -right-4 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                        >
                          <span className="text-xs text-white font-bold">
                            {unreadNotifications > 9 ? "9+" : unreadNotifications}
                          </span>
                        </motion.div>
                      )}
                    </Link>
                  </motion.div>

                  {/* Profile Menu (Desktop) */}
                  <div className="relative hidden md:block" ref={profileMenuRef}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <Avatar className="w-8 h-8 lg:w-10 lg:h-10 ring-2 ring-gray-200 dark:ring-gray-700">
                        <AvatarImage
                          src={user?.avatar?.url}
                          alt={user?.name || "User"}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="hidden lg:block text-left">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user?.name || "User"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user?.role === "admin" ? "Administrator" : "Athlete"}
                        </div>
                      </div>

                      <motion.div
                        animate={{ rotate: isProfileMenuOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div
                          variants={menuVariants}
                          initial="closed"
                          animate="open"
                          exit="closed"
                          className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/20 dark:border-gray-700/20 backdrop-blur-xl overflow-hidden z-50"
                        >
                          {/* Profile Header */}
                          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-12 h-12 ring-2 ring-white/20">
                                <AvatarImage
                                  src={user?.avatar?.url}
                                  alt={user?.name || "User"}
                                />
                                <AvatarFallback className="bg-white/20 text-white">
                                  {user?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold">{user?.name || "User"}</div>
                                <div className="text-sm opacity-90">{user?.email}</div>
                                {user?.role === "admin" && (
                                  <Badge className="mt-1 bg-white/20 text-white border-white/30">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Admin
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="p-2">
                            {[
                              { icon: User, label: "Profile", path: "/profile", desc: "Manage your account" },
                              { icon: Activity, label: "Dashboard", path: "/dashboard", desc: "Your activity overview" },
                              { icon: Bell, label: "Notifications", path: "/notifications", desc: "Stay updated", badge: unreadNotifications },
                              { icon: Settings, label: "Settings", path: "/settings", desc: "Preferences & privacy" },
                            ].map((item, index) => (
                              <motion.div
                                key={item.path}
                                variants={itemVariants}
                                initial="closed"
                                animate="open"
                                transition={{ delay: index * 0.05 }}
                              >
                                <Link
                                  to={item.path}
                                  onClick={() => setIsProfileMenuOpen(false)}
                                  className="flex items-center space-x-3 w-full p-3 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                                >
                                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors">
                                    <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {item.label}
                                      </span>
                                      {item.badge && item.badge > 0 && (
                                        <Badge className="bg-red-500 text-white text-xs">
                                          {item.badge}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {item.desc}
                                    </div>
                                  </div>
                                </Link>
                              </motion.div>
                            ))}

                            {user?.role === "admin" && (
                              <motion.div
                                variants={itemVariants}
                                initial="closed"
                                animate="open"
                                transition={{ delay: 0.2 }}
                              >
                                <Link
                                  to="/admin/dashboard"
                                  onClick={() => setIsProfileMenuOpen(false)}
                                  className="flex items-center space-x-3 w-full p-3 rounded-xl text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200 group border border-blue-200/50 dark:border-blue-700/50 mt-2"
                                >
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      Admin Panel
                                    </span>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Manage platform
                                    </div>
                                  </div>
                                </Link>
                              </motion.div>
                            )}

                            {/* Logout */}
                            <motion.div
                              variants={itemVariants}
                              initial="closed"
                              animate="open"
                              transition={{ delay: 0.25 }}
                              className="border-t border-gray-200/50 dark:border-gray-700/50 mt-2 pt-2"
                            >
                              <button
                                onClick={handleLogout}
                                className="flex items-center space-x-3 w-full p-3 rounded-xl text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group text-red-600 dark:text-red-400"
                              >
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/40">
                                  <LogOut className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <span className="font-medium">Sign Out</span>
                                  <div className="text-xs opacity-70">
                                    See you next time!
                                  </div>
                                </div>
                              </button>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                /* Auth Buttons */
                <div className="hidden md:flex items-center space-x-3">
                  <Link to="/login">
                    <Button variant="ghost " className="font-medium">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 lg:hidden"
                aria-label="Toggle menu"
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="lg:hidden fixed inset-x-0 top-16 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-700/20 shadow-xl"
          >
            <ScrollArea className="max-h-[calc(100vh-4rem)]">

              <div className="container mx-auto px-4 py-6 max-h-[calc(100vh-4rem)]">
                {/* User Profile (Mobile) */}
                {isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white mb-6"
                  >
                    <Avatar className="w-12 h-12 ring-2 ring-white/20">
                      <AvatarImage
                        src={user?.avatar?.url}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback className="bg-white/20 text-white">
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{user?.name || "User"}</div>
                      <div className="text-sm opacity-90">{user?.email}</div>
                      {user?.role === "admin" && (
                        <Badge className="mt-1 bg-white/20 text-white border-white/30 text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    {unreadNotifications > 0 && (
                      <div className="ml-auto">
                        <Badge className="bg-red-500 text-white">
                          {unreadNotifications} new
                        </Badge>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Navigation Links */}
                <div className="space-y-2 mb-6">
                  {navigationLinks.map((link, index) => {
                    const Icon = link.icon
                    const isActive = location.pathname === link.path

                    return (
                      <motion.div
                        key={link.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={link.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${isActive
                              ? "bg-blue-600 text-white shadow-lg"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        >
                          <Icon className="w-5 h-5" />
                          <div>
                            <div className="font-medium">{link.name}</div>
                            <div className={`text-xs ${isActive ? "text-white/80" : "text-gray-500 dark:text-gray-400"}`}>
                              {link.description}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>

                {isAuthenticated ? (
                  <>
                    {/* Quick Actions (Mobile) */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {quickActions.map((action, index) => {
                        const Icon = action.icon
                        return (
                          <motion.div
                            key={action.path}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                          >
                            <Link
                              to={action.path}
                              onClick={() => setIsMenuOpen(false)}
                              className={`flex items-center justify-center space-x-2 p-4 rounded-xl transition-all duration-300 ${action.color} ${action.bgColor}`}
                            >
                              <Icon className="w-5 h-5" />
                              <span className="font-medium">{action.name}</span>
                            </Link>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Account Links */}
                    <div className="space-y-2 border-t border-gray-200/50 dark:border-gray-700/50 pt-6">
                      {[
                        { icon: User, label: "Profile", path: "/profile" },
                        { icon: Bell, label: "Notifications", path: "/notifications", badge: unreadNotifications },
                        { icon: Settings, label: "Settings", path: "/settings" },
                        ...(user?.role === "admin" ? [{ icon: Shield, label: "Admin Panel", path: "/admin/dashboard" }] : [])
                      ].map((item, index) => (
                        <motion.div
                          key={item.path}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + index * 0.05 }}
                        >
                          <Link
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center justify-between p-4 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                          >
                            <div className="flex items-center space-x-4">
                              <item.icon className="w-5 h-5" />
                              <span className="font-medium">{item.label}</span>
                            </div>
                            {item.badge && item.badge > 0 && (
                              <Badge className="bg-red-500 text-white">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </motion.div>
                      ))}

                      {/* Logout */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-4 w-full p-4 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </motion.div>
                    </div>
                  </>
                ) : (
                  /* Auth Buttons (Mobile) */
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3 border-t border-gray-200/50 dark:border-gray-700/50 pt-6"
                  >
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full mb-4 justify-center text-base py-3">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base py-3">
                        Get Started
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header
