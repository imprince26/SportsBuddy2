"use client"

import { useState, useEffect } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Menu, X, Home, Calendar, User, Bell, LogOut, ChevronDown, Search, Moon, Sun, Shield } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Footer from "../Footer"

const Layout = () => {
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
    setIsProfileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }


  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? "bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md shadow-sm" : "bg-background-light dark:bg-background-dark"
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-primary-light dark:text-primary-dark"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m4.93 4.93 4.24 4.24" />
                <path d="m14.83 9.17 4.24-4.24" />
                <path d="m14.83 14.83 4.24 4.24" />
                <path d="m9.17 14.83-4.24 4.24" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              <span className="text-xl font-bold text-foreground-light dark:text-foreground-dark">SportsBuddy</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-primary-light dark:hover:text-primary-dark ${location.pathname === "/"
                  ? "text-primary-light dark:text-primary-dark"
                  : "text-foreground-light dark:text-foreground-dark"
                  }`}
              >
                Home
              </Link>
              <Link
                to="/events"
                className={`text-sm font-medium transition-colors hover:text-primary-light dark:hover:text-primary-dark ${location.pathname.includes("/events") && !location.pathname.includes("/create")
                  ? "text-primary-light dark:text-primary-dark"
                  : "text-foreground-light dark:text-foreground-dark"
                  }`}
              >
                Events
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-primary-light dark:hover:text-primary-dark ${location.pathname === "/dashboard"
                    ? "text-primary-light dark:text-primary-dark"
                    : "text-foreground-light dark:text-foreground-dark"
                    }`}
                >
                  Dashboard
                </Link>
              )}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Search Button */}
              <button
                onClick={() => navigate("/events")}
                className="p-2 rounded-full text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors md:flex items-center hidden"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <Link
                    to="/notifications"
                    className="relative p-2 rounded-full text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors hidden md:block"
                  >
                    <Bell size={20} />
                    {user?.notifications?.filter((n) => !n.read)?.length > 0 && (
                      <span className="absolute top-0 right-0 w-4 h-4 bg-destructive-light dark:bg-destructive-dark rounded-full flex items-center justify-center text-[10px] text-white">
                        {user.notifications.filter((n) => !n.read).length}
                      </span>
                    )}
                  </Link>

                  {/* Profile Menu (Desktop) */}
                  <div className="relative hidden md:block">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center space-x-2 focus:outline-none"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted-light dark:bg-muted-dark flex items-center justify-center">
                        {user?.avatar ? (
                          <img
                            src={user.avatar[0]?.url || "/placeholder.svg"}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={16} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-foreground-light dark:text-foreground-dark hidden lg:block">
                        {user?.name || "User"}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-foreground-light dark:text-foreground-dark transition-transform duration-200 ${isProfileMenuOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-48 py-2 bg-card-light dark:bg-card-dark rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                        >
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                          >
                            <User size={16} className="mr-2" />
                            Profile
                          </Link>
                          <Link
                            to="/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                          >
                            <Home size={16} className="mr-2" />
                            Dashboard
                          </Link>
                          <Link
                            to="/notifications"
                            className="flex items-center px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                          >
                            <Bell size={16} className="mr-2" />
                            Notifications
                          </Link>
                          {user?.role === "admin" && (
                            <Link
                              to="/admin/users"
                              className="flex items-center px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                            >
                              <Shield size={16} className="mr-2" />
                              Admin Panel
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center px-4 py-2 text-sm text-destructive-light dark:text-destructive-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                          >
                            <LogOut size={16} className="mr-2" />
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-foreground-light dark:text-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium bg-primary-light dark:bg-primary-dark text-white px-4 py-2 rounded-md hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors md:hidden"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link
                to="/"
                className="flex items-center py-2 text-foreground-light dark:text-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
              >
                <Home size={20} className="mr-3" />
                Home
              </Link>
              <Link
                to="/events"
                className="flex items-center py-2 text-foreground-light dark:text-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
              >
                <Calendar size={20} className="mr-3" />
                Events
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center py-2 text-foreground-light dark:text-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
                  >
                    <Home size={20} className="mr-3" />
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center py-2 text-foreground-light dark:text-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
                  >
                    <User size={20} className="mr-3" />
                    Profile
                  </Link>
                  <Link
                    to="/notifications"
                    className="flex items-center py-2 text-foreground-light dark:text-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
                  >
                    <Bell size={20} className="mr-3" />
                    Notifications
                    {user?.notifications?.filter((n) => n.read == false)?.length > 0 && (
                      <span className="ml-2 w-5 h-5 bg-destructive-light dark:bg-destructive-dark rounded-full flex items-center justify-center text-xs text-white">
                        {user.notifications.filter((n) => n.read == false).length}
                      </span>
                    )}
                  </Link>
                  {user?.role === "admin" && (
                    <Link
                      to="/admin/users"
                      className="flex items-center py-2 text-foreground-light dark:text-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
                    >
                      <Shield size={20} className="mr-3" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center py-2 w-full text-left text-destructive-light dark:text-destructive-dark hover:text-destructive-light/90 dark:hover:text-destructive-dark/90"
                  >
                    <LogOut size={20} className="mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    className="flex items-center py-2 text-foreground-light dark:text-foreground-dark hover:text-primary-light dark:hover:text-primary-dark"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center py-2 bg-primary-light dark:bg-primary-dark text-white rounded-md hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Layout
