import { motion } from "framer-motion"

const HeroBg = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0">
        {/* Primary Orb */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 dark:opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
          }}
        />
        
        {/* Secondary Orb */}
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 dark:opacity-8"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
          }}
        />
        
        {/* Accent Orb */}
        <motion.div
          className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-10 dark:opacity-5"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Flowing Lines */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            background: `linear-gradient(45deg, 
              transparent 0%, 
              rgba(59, 130, 246, 0.05) 25%, 
              transparent 50%, 
              rgba(139, 92, 246, 0.05) 75%, 
              transparent 100%)`,
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      {/* Subtle Grid */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Gentle Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/20 dark:to-slate-950/30" />
    </div>
  )
}

export default HeroBg