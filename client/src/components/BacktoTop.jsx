import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Zap, Trophy, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    const scrolled = document.documentElement.scrollTop;
    const maxHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrolled / maxHeight) * 100;
    
    setScrollProgress(progress);
    setIsVisible(scrolled > 300);
  };

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const containerVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.3,
      y: 100,
      rotate: -180
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.6
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.3,
      y: 100,
      rotate: 180,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const iconVariants = {
    normal: { 
      rotate: 0,
      scale: 1,
      y: 0
    },
    hover: { 
      rotate: [0, -10, 10, 0],
      scale: 1.1,
      y: -3,
      transition: {
        rotate: {
          duration: 0.6,
          ease: "easeInOut"
        },
        scale: {
          duration: 0.2
        },
        y: {
          duration: 0.2
        }
      }
    },
    tap: {
      scale: 0.9,
      y: 0
    }
  };

  const progressVariants = {
    hidden: { pathLength: 0 },
    visible: { 
      pathLength: scrollProgress / 100,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-6 right-6 z-50 group"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          {/* Main Button Container */}
          <motion.button
            onClick={scrollToTop}
            className={cn(
              "relative w-14 h-14 rounded-2xl overflow-hidden",
              "bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700",
              "hover:from-blue-700 hover:via-purple-700 hover:to-blue-800",
              "shadow-2xl hover:shadow-3xl",
              "border border-white/20",
              "backdrop-blur-xl",
              "transition-all duration-300",
              "group-hover:scale-105",
              "active:scale-95"
            )}
            whileHover="hover"
            whileTap="tap"
            style={{
              filter: isHovered ? 'brightness(1.1)' : 'brightness(1)',
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%),
                    radial-gradient(circle at 70% 70%, rgba(255,255,255,0.2) 0%, transparent 50%)
                  `
                }}
              />
            </div>

            {/* Animated Background Gradient */}
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                  'linear-gradient(90deg, #8b5cf6, #3b82f6)',
                  'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  'linear-gradient(45deg, #3b82f6, #8b5cf6)'
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Progress Ring */}
            <svg 
              className="absolute inset-0 w-full h-full -rotate-90" 
              viewBox="0 0 56 56"
            >
              {/* Background Ring */}
              <circle
                cx="28"
                cy="28"
                r="26"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                fill="none"
              />
              {/* Progress Ring */}
              <motion.circle
                cx="28"
                cy="28"
                r="26"
                stroke="#fbbf24"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                variants={progressVariants}
                initial="hidden"
                animate="visible"
                style={{
                  pathLength: scrollProgress / 100,
                  filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.6))'
                }}
              />
            </svg>

            {/* Main Icon */}
            <motion.div
              variants={iconVariants}
              className="absolute inset-0 flex items-center justify-center"
            >
              <ArrowUp className="w-6 h-6 text-white drop-shadow-lg" />
            </motion.div>

            {/* Floating Sports Icons */}
            {isHovered && (
              <div className="absolute inset-0 pointer-events-none">
                {[Trophy, Zap, Target].map((Icon, index) => (
                  <motion.div
                    key={index}
                    className="absolute"
                    initial={{ 
                      opacity: 0,
                      scale: 0,
                      x: 28,
                      y: 28
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 0.6, 0],
                      x: 28 + Math.cos((index * 120) * Math.PI / 180) * 25,
                      y: 28 + Math.sin((index * 120) * Math.PI / 180) * 25,
                    }}
                    transition={{
                      duration: 2,
                      delay: index * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Icon className="w-3 h-3 text-yellow-300" />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pulse Effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-white/20"
              animate={{
                scale: isHovered ? [1, 1.2, 1] : 1,
                opacity: isHovered ? [0.3, 0.1, 0.3] : 0,
              }}
              transition={{
                duration: 1.5,
                repeat: isHovered ? Infinity : 0,
                ease: "easeInOut"
              }}
            />

            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)`,
                transform: 'translateX(-100%)',
              }}
              animate={{
                transform: isHovered ? ['translateX(-100%)', 'translateX(100%)'] : 'translateX(-100%)',
              }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                repeat: isHovered ? Infinity : 0,
                repeatDelay: 2
              }}
            />
          </motion.button>

          {/* Tooltip */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap"
              >
                <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
                  Back to top
                  <div className="absolute top-1/2 -translate-y-1/2 left-full w-0 h-0 border-l-[6px] border-l-gray-900 dark:border-l-gray-100 border-y-[6px] border-y-transparent" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Particles */}
          {isHovered && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    y: [0, -20, -40],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          )}

          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;