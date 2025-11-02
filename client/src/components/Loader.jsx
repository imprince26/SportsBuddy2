import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const SportsBuddyLoader = ({ message = "Loading..." }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  useEffect(() => {
    // Check localStorage for theme
    const checkTheme = () => {
      const storedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDarkMode = storedTheme === "dark" || (!storedTheme && prefersDark);
      setIsDark(isDarkMode);
    };

    // Check immediately
    checkTheme();

    // Listen for storage changes (when theme is changed in another tab)
    const handleStorageChange = (e) => {
      if (e.key === "theme") {
        checkTheme();
      }
    };

    // Create observer to watch for class changes on html element
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    window.addEventListener("storage", handleStorageChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 transition-colors duration-300"
      style={{
        backgroundColor: isDark ? '#111827' : '#ffffff'
      }}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Spinner Ring */}
        <div className="relative w-16 h-16">
          {/* Outer Ring */}
          <motion.div
            className="absolute inset-0 border-4 rounded-full"
            style={{
              borderColor: isDark ? '#374151' : '#e5e7eb'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Spinning Accent Ring */}
          <motion.div
            className="absolute inset-0 border-4 border-transparent rounded-full"
            style={{
              borderTopColor: isDark ? '#3b82f6' : '#2563eb'
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          
          {/* Inner Circle */}
          <motion.div
            className="absolute inset-2 rounded-full"
            style={{
              backgroundColor: isDark ? '#3b82f6' : '#2563eb'
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        </div>

        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center"
        >
          <h1 
            className="text-2xl font-semibold mb-2"
            style={{
              color: isDark ? '#ffffff' : '#111827'
            }}
          >
            SportsBuddy
          </h1>
          
          {/* Loading Message */}
          <div className="flex items-center gap-2 justify-center">
            <p 
              className="text-sm"
              style={{
                color: isDark ? '#9ca3af' : '#4b5563'
              }}
            >
              {message}
            </p>
            <motion.div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: isDark ? '#3b82f6' : '#2563eb'
                  }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "200px" }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="h-1 rounded-full overflow-hidden"
          style={{
            backgroundColor: isDark ? '#374151' : '#e5e7eb'
          }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: isDark ? '#3b82f6' : '#2563eb'
            }}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default SportsBuddyLoader;