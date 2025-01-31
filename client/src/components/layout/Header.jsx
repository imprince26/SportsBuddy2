/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  MenuIcon,
  ActivityIcon,
  UserIcon,
  LogOutIcon,
  HomeIcon,
  CalendarIcon,
  PlusCircleIcon,
  XIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const NavLink = ({ to, children, icon: Icon, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center space-x-2 px-4 py-2 rounded-md
        transition-all duration-300 
        ${
          isActive
            ? "bg-[#4CAF50]/20 text-[#4CAF50]"
            : "text-[#81C784] hover:bg-[#4CAF50]/10 hover:text-[#4CAF50]"
        }
      `}
    >
      {Icon && <Icon className="h-5 w-5" />}
      <span>{children}</span>
    </Link>
  );
};

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const sidebarVariants = {
    hidden: {
      x: "100%",
      transition: {
        type: "tween",
        duration: 0.3,
      },
    },
    visible: {
      x: 0,
      transition: {
        type: "tween",
        duration: 0.3,
      },
    },
  };

  return (
    <>
      {/* Main Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F2C2C]/70 backdrop-blur-md border-b border-[#2E7D32]/20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <ActivityIcon
              className="h-8 w-8 text-[#4CAF50] animate-pulse"
              strokeWidth={1.5}
            />
            <h1 className="text-xl font-bold text-[#E0F2F1] tracking-tight">
              Sports Buddy
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/events">Events</NavLink>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              user.role === "guest" ? (
                <div className="hidden"></div>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <Button
                    onClick={() => navigate("/events/user/my-events")}
                    className="flex items-center bg-transparent hover:bg-[#4CAF50]/10 space-x-1"
                  >
                    <UserIcon className="text-[#4CAF50]" />
                    <span className="text-[#E0F2F1] text-sm font-semibold">
                      {user ? user.name : "Guest"}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-[#FF5252] hover:bg-[#FF5252]/10 hover:text-[#FF5252]/80"
                    onClick={handleLogout}
                  >
                    <LogOutIcon className="h-5 w-5" />
                    Logout
                  </Button>
                </div>
              )
            ) : (
              <div className="flex space-x-2">
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-[#4CAF50] text-white hover:bg-[#388E3C]"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  variant="outline"
                  className="border-[#4CAF50] bg-transparent text-[#4CAF50] hover:text-[#4CAF50]/80 hover:bg-[#4CAF50]/10"
                >
                  Register
                </Button>
              </div>
            )}
            <Button
              className="md:hidden   bg-[#4CAF50] text-white hover:bg-[#388E3C]"
              onClick={toggleMobileMenu}
            >
              <MenuIcon className="h-6 w-6 text-[#E0F2F1]" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50 md:hidden"
              onClick={toggleMobileMenu}
            />

            {/* Sidebar */}
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={sidebarVariants}
              className="fixed top-0 right-0 w-64 h-full bg-[#0F2C2C] z-50 shadow-2xl md:hidden"
            >
              {/* Sidebar Header */}
              <div className="flex justify-between items-center p-4 border-b border-[#2E7D32]/20">
                <Button
                  onClick={() => navigate("/events/user/my-events")}
                  className="flex items-center bg-transparent hover:bg-[#4CAF50]/10 space-x-2"
                >
                  <UserIcon className="h-6 w-6 text-[#4CAF50]" />
                  <span className="text-[#E0F2F1] font-semibold">
                    {user ? user.name : "Guest"}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="hover:bg-[#FF5252]/10"
                  onClick={toggleMobileMenu}
                >
                  <XIcon className=" text-[#FF5252]" />
                </Button>
              </div>

              {/* Sidebar Navigation */}
              <nav className="flex flex-col space-y-2 p-4">
                {/* Always visible links */}
                <NavLink to="/" icon={HomeIcon} onClick={toggleMobileMenu}>
                  Home
                </NavLink>
                <NavLink
                  to="/events"
                  icon={CalendarIcon}
                  onClick={toggleMobileMenu}
                >
                  Events
                </NavLink>

                {user && (
                  <NavLink
                    to="/events/create"
                    icon={PlusCircleIcon}
                    onClick={toggleMobileMenu}
                  >
                    Create Event
                  </NavLink>
                )}

                {user ? (
                  <Button
                    variant="ghost"
                    className="justify-start text-[#FF5252] hover:bg-[#FF5252]/10 hover:text-[#FF5252]/80 px-4 py-2 w-full"
                    onClick={handleLogout}
                  >
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-[#4CAF50] text-[#4CAF50] hover:text-[#4CAF50]/80 hover:bg-[#4CAF50]/10"
                      onClick={() => {
                        navigate("/login");
                        toggleMobileMenu();
                      }}
                    >
                      <UserIcon className="mr-2 h-4 w-4" />
                      Login
                    </Button>
                    <Button
                      className="w-full bg-[#4CAF50] text-white hover:bg-[#388E3C]"
                      onClick={() => {
                        navigate("/register");
                        toggleMobileMenu();
                      }}
                    >
                      <PlusCircleIcon className="mr-2 h-4 w-4" />
                      Register
                    </Button>
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
