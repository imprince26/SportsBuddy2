import { useEffect, useState } from 'react';
import toast, { Toaster, ToastBar } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeProvider';
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Toast animation variants
const toastVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const CustomToast = () => {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 2000,
        className: cn(
          'backdrop-blur-lg rounded-lg shadow-lg flex items-center space-x-2 p-4 max-w-xs',
          theme === 'dark'
            ? 'bg-card-dark/90 border-border-dark'
            : 'bg-card-light/90 border-border-light'
        ),
        style: {
          padding: '0',
          background: 'transparent',
          border: 'none',
        },
        success: {
          className: cn(
            'bg-gradient-to-r',
            theme === 'dark'
              ? 'from-primary-dark/20 to-secondary-dark/20 text-foreground-dark'
              : 'from-primary-light/20 to-secondary-light/20 text-foreground-light'
          ),
        },
        error: {
          className: cn(
            theme === 'dark'
              ? 'bg-destructive-dark/20 border-destructive-dark text-foreground-dark'
              : 'bg-destructive-light/20 border-destructive-light text-foreground-light'
          ),
        },
        loading: {
          className: cn(
            theme === 'dark'
              ? 'bg-muted-dark/20 border-muted-dark text-foreground-dark'
              : 'bg-muted-light/20 border-muted-light text-foreground-light'
          ),
        },
        warning: {
          className: cn(
            theme === 'dark'
              ? 'bg-warning-dark/20 border-warning-dark text-foreground-dark'
              : 'bg-warning-light/20 border-warning-light text-foreground-light'
          ),
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ message }) => (
            <motion.div
              variants={toastVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={cn(
                'flex items-center space-x-3 p-4 rounded-lg w-full',
                t.type === 'success' &&
                  (theme === 'dark'
                    ? 'bg-gradient-to-r from-primary-dark/20 to-secondary-dark/20'
                    : 'bg-gradient-to-r from-primary-light/20 to-secondary-light/20'),
                t.type === 'error' &&
                  (theme === 'dark'
                    ? 'bg-destructive-dark/20 border-destructive-dark'
                    : 'bg-destructive-light/20 border-destructive-light'),
                t.type === 'loading' &&
                  (theme === 'dark'
                    ? 'bg-muted-dark/20 border-muted-dark'
                    : 'bg-muted-light/20 border-muted-light'),
                t.type === 'warning' &&
                  (theme === 'dark'
                    ? 'bg-warning-dark/20 border-warning-dark'
                    : 'bg-warning-light/20 border-warning-light')
              )}
            >
              {/* Custom Icon */}
              <div>
                {t.type === 'success' && (
                  <CheckCircle
                    className={cn(
                      'h-5 w-5',
                      theme === 'dark' ? 'text-secondary-dark' : 'text-secondary-light'
                    )}
                  />
                )}
                {t.type === 'error' && (
                  <XCircle
                    className={cn(
                      'h-5 w-5',
                      theme === 'dark' ? 'text-destructive-dark' : 'text-destructive-light'
                    )}
                  />
                )}
                {t.type === 'loading' && (
                  <Loader2
                    className={cn(
                      'h-5 w-5 animate-spin',
                      theme === 'dark' ? 'text-foreground-dark' : 'text-foreground-light'
                    )}
                  />
                )}
                {t.type === 'warning' && (
                  <AlertTriangle
                    className={cn(
                      'h-5 w-5',
                      theme === 'dark' ? 'text-warning-dark' : 'text-warning-light'
                    )}
                  />
                )}
              </div>

              {/* Message */}
              <div
                className={cn(
                  'flex-1 text-sm font-semibold',
                  theme === 'dark' ? 'text-foreground-dark' : 'text-foreground-light'
                )}
              >
                {message}
              </div>

              {/* Close Button */}
              {t.type !== 'loading' && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toast.dismiss(t.id)}
                  className={cn(
                    'p-1 rounded-full',
                    theme === 'dark'
                      ? 'text-muted-foreground-dark hover:bg-border-dark'
                      : 'text-muted-foreground-light hover:bg-border-light'
                  )}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </motion.button>
              )}
            </motion.div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};

// Custom toast methods
export const showToast = {
  success: (message, options = {}) =>
    toast.success(message, {
      ...options,
      className: options.className || '',
    }),
  error: (message, options = {}) =>
    toast.error(message, {
      ...options,
      className: options.className || '',
    }),
  loading: (message, options = {}) =>
    toast.loading(message, {
      ...options,
      className: options.className || '',
    }),
  warning: (message, options = {}) =>
    toast(message, {
      ...options,
      type: 'warning',
      className: options.className || '',
    }),
};

export default CustomToast;