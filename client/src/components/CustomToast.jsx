import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeProvider';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  X,
  Info,
  Trophy,
  Zap,
  Heart,
  Star,
  Sparkles,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Premium toast animation variants
const toastVariants = {
  initial: {
    opacity: 0,
    y: -20,
    x: 100,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    x: 100,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
};

const iconVariants = {
  initial: { scale: 0, rotate: -90 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
      delay: 0.05
    }
  }
};

const shimmerVariants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 3,
      ease: 'linear',
      repeat: Infinity,
    }
  }
};

const CustomToast = () => {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return CheckCircle2;
      case 'error':
        return XCircle;
      case 'loading':
        return Loader2;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      case 'achievement':
        return Trophy;
      case 'sports':
        return Zap;
      default:
        return Info;
    }
  };

  const getToastStyles = (type, currentTheme) => {
    const isDark = currentTheme === 'dark';
    
    // Base styles for both themes
    const baseLight = "bg-white/95 backdrop-blur-xl border shadow-xl";
    const baseDark = "bg-slate-900/95 backdrop-blur-xl border shadow-2xl";
    const base = isDark ? baseDark : baseLight;

    switch (type) {
      case 'success':
        return cn(
          base,
          isDark 
            ? 'border-green-500/30 shadow-green-500/10' 
            : 'border-green-200/60 shadow-green-100/50'
        );
      case 'error':
        return cn(
          base,
          isDark 
            ? 'border-red-500/30 shadow-red-500/10' 
            : 'border-red-200/60 shadow-red-100/50'
        );
      case 'warning':
        return cn(
          base,
          isDark 
            ? 'border-yellow-500/30 shadow-yellow-500/10' 
            : 'border-yellow-200/60 shadow-yellow-100/50'
        );
      case 'info':
        return cn(
          base,
          isDark 
            ? 'border-blue-500/30 shadow-blue-500/10' 
            : 'border-blue-200/60 shadow-blue-100/50'
        );
      case 'loading':
        return cn(
          base,
          isDark 
            ? 'border-slate-700/40 shadow-slate-900/20' 
            : 'border-slate-200/60 shadow-slate-100/50'
        );
      case 'achievement':
        return cn(
          base,
          isDark 
            ? 'border-purple-500/30 shadow-purple-500/10' 
            : 'border-purple-200/60 shadow-purple-100/50'
        );
      case 'sports':
        return cn(
          base,
          isDark 
            ? 'border-primary/30 shadow-primary/10' 
            : 'border-primary/30 shadow-primary/20'
        );
      default:
        return cn(
          base,
          isDark 
            ? 'border-slate-700/40 shadow-slate-900/20' 
            : 'border-slate-200/60 shadow-slate-100/50'
        );
    }
  };

  const getIconWrapperStyles = (type, currentTheme) => {
    const isDark = currentTheme === 'dark';
    
    switch (type) {
      case 'success':
        return isDark 
          ? 'bg-green-500/15 text-green-400' 
          : 'bg-green-50 text-green-600';
      case 'error':
        return isDark 
          ? 'bg-red-500/15 text-red-400' 
          : 'bg-red-50 text-red-600';
      case 'warning':
        return isDark 
          ? 'bg-yellow-500/15 text-yellow-400' 
          : 'bg-yellow-50 text-yellow-600';
      case 'info':
        return isDark 
          ? 'bg-blue-500/15 text-blue-400' 
          : 'bg-blue-50 text-blue-600';
      case 'loading':
        return isDark 
          ? 'bg-slate-700/30 text-slate-400' 
          : 'bg-slate-100 text-slate-600';
      case 'achievement':
        return isDark 
          ? 'bg-purple-500/15 text-purple-400' 
          : 'bg-purple-50 text-purple-600';
      case 'sports':
        return isDark 
          ? 'bg-primary/15 text-primary' 
          : 'bg-primary/10 text-primary';
      default:
        return isDark 
          ? 'bg-slate-700/30 text-slate-400' 
          : 'bg-slate-100 text-slate-600';
    }
  };

  const getAccentColor = (type) => {
    switch (type) {
      case 'success': return 'from-green-500 to-emerald-500';
      case 'error': return 'from-red-500 to-rose-500';
      case 'warning': return 'from-yellow-500 to-orange-500';
      case 'info': return 'from-blue-500 to-cyan-500';
      case 'achievement': return 'from-purple-500 to-pink-500';
      case 'sports': return 'from-primary to-blue-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <Toaster
      position="bottom-right"
      containerStyle={{
        bottom: 24,
        right: 24,
        zIndex: 9999,
      }}
      gutter={12}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: '0',
          margin: '0',
          maxWidth: '450px',
          width: '100%',
        },
      }}
    >
      {(t) => (
        <AnimatePresence mode="wait">
          <motion.div
            key={t.id}
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
            className={cn(
              'rounded-2xl p-4 min-w-[340px] max-w-[450px] relative overflow-hidden group cursor-pointer',
              getToastStyles(t.type, theme)
            )}
            onClick={() => toast.dismiss(t.id)}
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
          >
            {/* Top accent bar with gradient */}
            <div className={cn(
              'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
              getAccentColor(t.type)
            )} />

            {/* Shimmer effect on hover */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `linear-gradient(90deg, 
                  transparent 0%, 
                  ${theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} 50%, 
                  transparent 100%)`,
                backgroundSize: '200% 100%',
              }}
              variants={shimmerVariants}
              animate="animate"
            />

            {/* Main content */}
            <div className="relative z-10 flex items-start gap-3.5">
              {/* Icon container */}
              <motion.div
                variants={iconVariants}
                initial="initial"
                animate="animate"
                className={cn(
                  'flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center relative',
                  getIconWrapperStyles(t.type, theme)
                )}
              >
                {/* Icon glow effect */}
                <div className={cn(
                  'absolute inset-0 rounded-xl blur-xl opacity-40',
                  getIconWrapperStyles(t.type, theme)
                )} />
                
                {(() => {
                  const IconComponent = getToastIcon(t.type);
                  return (
                    <IconComponent
                      className={cn(
                        'w-5 h-5 relative z-10',
                        t.type === 'loading' && 'animate-spin'
                      )}
                      strokeWidth={2.5}
                    />
                  );
                })()}

                {/* Pulsing ring for loading */}
                {t.type === 'loading' && (
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-current opacity-30"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.div>

              {/* Message content */}
              <div className="flex-1 min-w-0 pt-0.5">
                {typeof t.message === 'string' ? (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className={cn(
                      'text-[15px] font-semibold leading-relaxed',
                      theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                    )}
                  >
                    {t.message}
                  </motion.p>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className={theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}
                  >
                    {t.message}
                  </motion.div>
                )}
              </div>

              {/* Close button */}
              {t.type !== 'loading' && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss(t.id);
                  }}
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                    theme === 'dark'
                      ? 'hover:bg-white/10 text-slate-400 hover:text-slate-200'
                      : 'hover:bg-black/5 text-slate-500 hover:text-slate-700'
                  )}
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </motion.button>
              )}
            </div>

            {/* Decorative particles for achievement/sports */}
            {(t.type === 'achievement' || t.type === 'sports') && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      'absolute w-1.5 h-1.5 rounded-full',
                      theme === 'dark' ? 'bg-white/20' : 'bg-black/10'
                    )}
                    initial={{
                      x: Math.random() * 400,
                      y: Math.random() * 80,
                      scale: 0,
                      opacity: 0,
                    }}
                    animate={{
                      y: [null, Math.random() * -30],
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5 + Math.random(),
                      delay: i * 0.15,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
            )}

            {/* Gradient overlay for depth */}
            <div 
              className={cn(
                'absolute inset-0 rounded-2xl pointer-events-none',
                theme === 'dark'
                  ? 'bg-gradient-to-br from-white/[0.02] to-transparent'
                  : 'bg-gradient-to-br from-white/40 to-transparent'
              )}
            />
          </motion.div>
        </AnimatePresence>
      )}
    </Toaster>
  );
};

// Enhanced toast methods with SportsBuddy theming
export const showToast = {
  success: (message, options = {}) =>
    toast.success(message, {
      duration: 4000,
      ...options,
    }),

  error: (message, options = {}) =>
    toast.error(message, {
      duration: 5000,
      ...options,
    }),

  warning: (message, options = {}) =>
    toast(message, {
      type: 'warning',
      duration: 4500,
      ...options,
    }),

  info: (message, options = {}) =>
    toast(message, {
      type: 'info',
      duration: 4000,
      ...options,
    }),

  loading: (message, options = {}) =>
    toast.loading(message, {
      duration: Infinity,
      ...options,
    }),

  // Special SportsBuddy-specific toast types
  achievement: (message, options = {}) =>
    toast(message, {
      type: 'achievement',
      duration: 5000,
      ...options,
    }),

  sports: (message, options = {}) =>
    toast(message, {
      type: 'sports',
      duration: 4500,
      ...options,
    }),

  // Rich content toasts
  richSuccess: (title, description, options = {}) =>
    toast.success(
      <div className="space-y-1">
        <div className="font-bold text-base leading-tight">{title}</div>
        <div className="text-sm opacity-75 leading-snug">{description}</div>
      </div>,
      {
        duration: 5000,
        ...options,
      }
    ),

  richError: (title, description, options = {}) =>
    toast.error(
      <div className="space-y-1">
        <div className="font-bold text-base leading-tight">{title}</div>
        <div className="text-sm opacity-75 leading-snug">{description}</div>
      </div>,
      {
        duration: 6000,
        ...options,
      }
    ),

  richInfo: (title, description, options = {}) =>
    toast(
      <div className="space-y-1">
        <div className="font-bold text-base leading-tight">{title}</div>
        <div className="text-sm opacity-75 leading-snug">{description}</div>
      </div>,
      {
        type: 'info',
        duration: 5000,
        ...options,
      }
    ),

  richWarning: (title, description, options = {}) =>
    toast(
      <div className="space-y-1">
        <div className="font-bold text-base leading-tight">{title}</div>
        <div className="text-sm opacity-75 leading-snug">{description}</div>
      </div>,
      {
        type: 'warning',
        duration: 5000,
        ...options,
      }
    ),

  // SportsBuddy specific rich toasts
  eventJoined: (eventName, options = {}) =>
    toast(
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
          <Heart className="w-5 h-5 text-white" strokeWidth={2.5} fill="white" />
        </div>
        <div className="flex-1 space-y-0.5">
          <div className="font-bold text-base leading-tight">Event Joined!</div>
          <div className="text-sm opacity-75 leading-snug">You're now part of {eventName}</div>
        </div>
      </div>,
      {
        type: 'sports',
        duration: 5000,
        ...options,
      }
    ),

  eventCreated: (eventName, options = {}) =>
    toast(
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
          <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 space-y-0.5">
          <div className="font-bold text-base leading-tight">Event Created!</div>
          <div className="text-sm opacity-75 leading-snug">{eventName} is ready for participants</div>
        </div>
      </div>,
      {
        type: 'achievement',
        duration: 5000,
        ...options,
      }
    ),

  goalAchieved: (goalName, options = {}) =>
    toast(
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/20">
          <Target className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 space-y-0.5">
          <div className="font-bold text-base leading-tight">Goal Achieved! 🎯</div>
          <div className="text-sm opacity-75 leading-snug">{goalName}</div>
        </div>
      </div>,
      {
        type: 'achievement',
        duration: 5000,
        ...options,
      }
    ),

  newAchievement: (achievementName, options = {}) =>
    toast(
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
          <Trophy className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 space-y-0.5">
          <div className="font-bold text-base leading-tight">New Achievement! 🏆</div>
          <div className="text-sm opacity-75 leading-snug">{achievementName}</div>
        </div>
      </div>,
      {
        type: 'achievement',
        duration: 6000,
        ...options,
      }
    ),

  dismiss: (toastId) => toast.dismiss(toastId),
  dismissAll: () => toast.dismiss(),
};

export default CustomToast;
