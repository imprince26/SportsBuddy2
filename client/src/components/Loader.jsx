import { motion } from "framer-motion"

const SportsBuddyLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background-light dark:bg-background-dark z-50">
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20">
          <motion.div
            className="absolute inset-0 border-4 border-primary-light dark:border-primary-dark rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="absolute inset-0 border-4 border-t-transparent border-primary-light dark:border-primary-dark rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 border-4 border-accent-light dark:border-accent-dark rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          <motion.div
            className="absolute inset-2 border-4 border-t-transparent border-accent-light dark:border-accent-dark rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-4 bg-primary-light dark:bg-primary-dark rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          />
        </div>
        <motion.h2
          className="mt-6 text-xl font-bold text-foreground-light dark:text-foreground-dark"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          SportsBuddy
        </motion.h2>
        <motion.p
          className="mt-2 text-sm text-muted-foreground-light dark:text-muted-foreground-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          Loading amazing sports events...
        </motion.p>
      </div>
    </div>
  )
}

export default SportsBuddyLoader
