import { useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Home, Calendar, ArrowLeft } from 'lucide-react'

const NotFound = () => {

  // Page Title
  useEffect(() => {
    document.title = '404 - SportsBuddy';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-32 h-32 mx-auto mb-6">
            <motion.div
              className="absolute inset-0 border-4 border-primary-light dark:border-primary-dark rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              className="absolute inset-0 border-4 border-t-transparent border-primary-light dark:border-primary-dark rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              404
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground-light dark:text-foreground-dark mb-4">
            Page Not Found
          </h1>
          <p className="text-muted-foreground-light dark:text-muted-foreground-dark mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 p-3 bg-primary-light dark:bg-primary-dark text-white rounded-md hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
            >
              <Home size={18} />
              <span>Go Home</span>
            </Link>
            <Link
              to="/events"
              className="flex items-center justify-center gap-2 p-3 bg-card-light dark:bg-card-dark text-foreground-light dark:text-foreground-dark rounded-md border border-border-light dark:border-border-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
            >
              <Calendar size={18} />
              <span>Browse Events</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 p-3 bg-card-light dark:bg-card-dark text-foreground-light dark:text-foreground-dark rounded-md border border-border-light dark:border-border-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
            >
              <ArrowLeft size={18} />
              <span>Go Back</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFound
