import { motion } from "framer-motion"

const HeroBg = () => {
  return (
     <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-blue-800/90" />

          {/* 3D Floating Orbs */}
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${15 + (i % 4) * 8}px`,
                  height: `${15 + (i % 4) * 8}px`,
                  background: `linear-gradient(135deg, ${
                    ['rgba(59, 130, 246, 0.3)', 'rgba(139, 92, 246, 0.3)', 'rgba(34, 197, 94, 0.3)', 'rgba(251, 191, 36, 0.3)'][i % 4]
                  }, transparent)`,
                  backdropFilter: 'blur(10px)',
                  left: `${10 + (i * 7) % 80}%`,
                  top: `${20 + (i * 6) % 60}%`,
                }}
                animate={{
                  y: [0, -25, 0],
                  x: [0, 15, 0],
                  rotateX: [0, 360],
                  rotateY: [0, 180],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4 + (i % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          {/* 3D Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                transform: 'perspective(800px) rotateX(15deg)',
              }}
            />
          </div>

          {/* Large 3D Geometric Shapes */}
          <motion.div
            className="absolute top-16 left-8 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-2xl opacity-20"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              transform: 'perspective(1000px) rotateX(10deg) rotateY(10deg)',
            }}
            animate={{
              rotateX: [10, 20, 10],
              rotateY: [10, 20, 10],
              y: [0, -15, 0],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute bottom-16 right-8 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-full opacity-20"
            style={{
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              transform: 'perspective(1000px) rotateX(-10deg) rotateY(-10deg)',
            }}
            animate={{
              rotateX: [-10, -20, -10],
              rotateY: [-10, -20, -10],
              y: [0, 15, 0],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>
  )
}

export default HeroBg
