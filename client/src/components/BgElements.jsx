import { motion } from "framer-motion"

const BgElements = () => {
  return (
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-blue-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-blue-950/20" />
        
        {/* Animated Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Floating Geometric Shapes */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute opacity-10"
            style={{
              left: `${20 + (i * 12) % 80}%`,
              top: `${15 + (i * 15) % 70}%`,
              width: `${40 + (i % 3) * 20}px`,
              height: `${40 + (i % 3) * 20}px`,
              background: `linear-gradient(135deg, ${
                ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][i % 5]
              }, transparent)`,
              borderRadius: i % 2 === 0 ? '50%' : '20%',
            }}
            animate={{
              y: [0, -25, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 6 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        </div>
      </div>
  )
}

export default BgElements
