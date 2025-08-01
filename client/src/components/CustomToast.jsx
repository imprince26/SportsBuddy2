import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeProvider';
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  X,
  Info,
  Trophy,
  Zap,
  Heart,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced toast animation variants
const toastVariants = {
  initial: {
    opacity: 0,
    x: 100,
    scale: 0.8,
    rotateY: 90
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    rotateY: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.8,
    rotateY: -90,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
};

const iconBounceVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15,
      delay: 0.1
    }
  }
};

const progressVariants = {
  initial: { width: "100%" },
  animate: {
    width: "0%",
    transition: {
      duration: 3,
      ease: "linear"
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
        return CheckCircle;
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

  const getToastStyles = (type, theme) => {
    const baseStyles = "relative overflow-hidden backdrop-blur-xl border shadow-2xl";

    if (theme === 'dark') {
      switch (type) {
        case 'success':
          return `${baseStyles} bg-gradient-to-r from-green-900/90 to-emerald-900/90 border-green-500/30 text-green-100`;
        case 'error':
          return `${baseStyles} bg-gradient-to-r from-red-900/90 to-rose-900/90 border-red-500/30 text-red-100`;
        case 'warning':
          return `${baseStyles} bg-gradient-to-r from-yellow-900/90 to-amber-900/90 border-yellow-500/30 text-yellow-100`;
        case 'info':
          return `${baseStyles} bg-gradient-to-r from-blue-900/90 to-cyan-900/90 border-blue-500/30 text-blue-100`;
        case 'loading':
          return `${baseStyles} bg-gradient-to-r from-gray-800/90 to-gray-900/90 border-gray-600/30 text-gray-100`;
        case 'achievement':
          return `${baseStyles} bg-gradient-to-r from-purple-900/90 to-indigo-900/90 border-purple-500/30 text-purple-100`;
        case 'sports':
          return `${baseStyles} bg-gradient-to-r from-blue-900/90 to-purple-900/90 border-blue-500/30 text-blue-100`;
        default:
          return `${baseStyles} bg-gradient-to-r from-gray-800/90 to-gray-900/90 border-gray-600/30 text-gray-100`;
      }
    } else {
      switch (type) {
        case 'success':
          return `${baseStyles} bg-gradient-to-r from-green-50/95 to-emerald-50/95 border-green-300/50 text-green-800`;
        case 'error':
          return `${baseStyles} bg-gradient-to-r from-red-50/95 to-rose-50/95 border-red-300/50 text-red-800`;
        case 'warning':
          return `${baseStyles} bg-gradient-to-r from-yellow-50/95 to-amber-50/95 border-yellow-300/50 text-yellow-800`;
        case 'info':
          return `${baseStyles} bg-gradient-to-r from-blue-50/95 to-cyan-50/95 border-blue-300/50 text-blue-800`;
        case 'loading':
          return `${baseStyles} bg-gradient-to-r from-gray-50/95 to-gray-100/95 border-gray-300/50 text-gray-800`;
        case 'achievement':
          return `${baseStyles} bg-gradient-to-r from-purple-50/95 to-indigo-50/95 border-purple-300/50 text-purple-800`;
        case 'sports':
          return `${baseStyles} bg-gradient-to-r from-blue-50/95 to-purple-50/95 border-blue-300/50 text-blue-800`;
        default:
          return `${baseStyles} bg-gradient-to-r from-gray-50/95 to-gray-100/95 border-gray-300/50 text-gray-800`;
      }
    }
  };

  const getIconStyles = (type, theme) => {
    if (theme === 'dark') {
      switch (type) {
        case 'success':
          return 'text-green-400';
        case 'error':
          return 'text-red-400';
        case 'warning':
          return 'text-yellow-400';
        case 'info':
          return 'text-blue-400';
        case 'loading':
          return 'text-gray-400';
        case 'achievement':
          return 'text-purple-400';
        case 'sports':
          return 'text-blue-400';
        default:
          return 'text-gray-400';
      }
    } else {
      switch (type) {
        case 'success':
          return 'text-green-600';
        case 'error':
          return 'text-red-600';
        case 'warning':
          return 'text-yellow-600';
        case 'info':
          return 'text-blue-600';
        case 'loading':
          return 'text-gray-600';
        case 'achievement':
          return 'text-purple-600';
        case 'sports':
          return 'text-blue-600';
        default:
          return 'text-gray-600';
      }
    }
  };

  const getProgressBarColor = (type, theme) => {
    if (theme === 'dark') {
      switch (type) {
        case 'success':
          return 'bg-green-500';
        case 'error':
          return 'bg-red-500';
        case 'warning':
          return 'bg-yellow-500';
        case 'info':
          return 'bg-blue-500';
        case 'achievement':
          return 'bg-purple-500';
        case 'sports':
          return 'bg-gradient-to-r from-blue-500 to-purple-500';
        default:
          return 'bg-gray-500';
      }
    } else {
      switch (type) {
        case 'success':
          return 'bg-green-500';
        case 'error':
          return 'bg-red-500';
        case 'warning':
          return 'bg-yellow-500';
        case 'info':
          return 'bg-blue-500';
        case 'achievement':
          return 'bg-purple-500';
        case 'sports':
          return 'bg-gradient-to-r from-blue-500 to-purple-500';
        default:
          return 'bg-gray-500';
      }
    }
  };

  return (
    <Toaster
      position="top-right"
      containerStyle={{
        top: 20,
        right: 20,
        zIndex: 9999,
      }}
      toastOptions={{
        duration: 3000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: '0',
          margin: '0 0 16px 0',
          maxWidth: '420px',
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
              'rounded-2xl p-4 min-w-[320px] max-w-[420px] relative group cursor-pointer',
              getToastStyles(t.type, theme)
            )}
            onClick={() => toast.dismiss(t.id)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 rounded-2xl opacity-10">
              <div
                className="w-full h-full rounded-2xl"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)
                  `
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-start gap-4">
              {/* Icon */}
              <motion.div
                variants={iconBounceVariants}
                initial="initial"
                animate="animate"
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                  theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
                )}
              >
                {(() => {
                  const IconComponent = getToastIcon(t.type);
                  return (
                    <IconComponent
                      className={cn(
                        'w-6 h-6',
                        getIconStyles(t.type, theme),
                        t.type === 'loading' && 'animate-spin'
                      )}
                    />
                  );
                })()}
              </motion.div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                {typeof t.message === 'string' ? (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm font-semibold leading-relaxed"
                  >
                    {t.message}
                  </motion.p>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {t.message}
                  </motion.div>
                )}
              </div>

              {/* Close Button */}
              {t.type !== 'loading' && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss(t.id);
                  }}
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                    theme === 'dark'
                      ? 'hover:bg-white/10 text-white/60 hover:text-white'
                      : 'hover:bg-black/10 text-black/60 hover:text-black'
                  )}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            {/* Progress Bar */}
            <motion.div
              className={cn(
                'absolute bottom-0 left-0 h-1 rounded-b-2xl',
                getProgressBarColor(t.type, theme)
              )}
              variants={progressVariants}
              initial="initial"
              animate="animate"
            />

            {/* Floating Sports Icons for Achievement/Sports toasts */}
            {(t.type === 'achievement' || t.type === 'sports') && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-2xl opacity-20"
                    initial={{
                      x: Math.random() * 300,
                      y: Math.random() * 100,
                      scale: 0,
                      rotate: 0
                    }}
                    animate={{
                      y: [null, -20, null],
                      scale: [0, 1, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.3,
                      ease: "easeInOut"
                    }}
                  >
                    {t.type === 'achievement' ? '🏆' : ['⚽', '🏀', '🎾'][i]}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`,
                transform: 'translateX(-100%)',
              }}
              animate={{
                transform: ['translateX(-100%)', 'translateX(100%)'],
              }}
              transition={{
                duration: 2,
                delay: 0.5,
                ease: "easeInOut"
              }}
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
      duration: 3000,
      ...options,
    }),

  error: (message, options = {}) =>
    toast.error(message, {
      duration: 4000,
      ...options,
    }),

  warning: (message, options = {}) =>
    toast(message, {
      type: 'warning',
      duration: 4000,
      ...options,
    }),

  info: (message, options = {}) =>
    toast(message, {
      type: 'info',
      duration: 3500,
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
      duration: 4000,
      ...options,
    }),

  // Rich content toasts
  richSuccess: (title, description, options = {}) =>
    toast.success(
      <div>
        <div className="font-bold text-base mb-1">{title}</div>
        <div className="text-sm opacity-90">{description}</div>
      </div>,
      {
        duration: 4000,
        ...options,
      }
    ),

  richError: (title, description, options = {}) =>
    toast.error(
      <div>
        <div className="font-bold text-base mb-1">{title}</div>
        <div className="text-sm opacity-90">{description}</div>
      </div>,
      {
        duration: 5000,
        ...options,
      }
    ),

  eventJoined: (eventName, options = {}) =>
    toast(
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <Heart className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-bold text-base">Event Joined!</div>
          <div className="text-sm opacity-90">You're now part of {eventName}</div>
        </div>
      </div>,
      {
        type: 'sports',
        duration: 4000,
        ...options,
      }
    ),

  eventCreated: (eventName, options = {}) =>
    toast(
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <Star className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-bold text-base">Event Created!</div>
          <div className="text-sm opacity-90">{eventName} is ready for participants</div>
        </div>
      </div>,
      {
        type: 'achievement',
        duration: 4000,
        ...options,
      }
    ),

  dismiss: (toastId) => toast.dismiss(toastId),
  dismissAll: () => toast.dismiss(),
};

export default CustomToast;