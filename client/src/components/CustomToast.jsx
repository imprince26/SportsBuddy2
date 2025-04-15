import { useEffect, useState } from 'react';
import toast, { Toaster, ToastBar } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeProvider';
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
        duration: 5000,
        className: cn(
          'backdrop-blur-lg rounded-lg shadow-lg flex items-center space-x-2 p-4 max-w-xs',
          theme === 'dark'
            ? 'bg-[#1f2937]/90 border-[#4b5563]'
            : 'bg-[#ffffff]/90 border-[#d1d5db]'
        ),
        style: {
          padding: '0',
          background: 'transparent',
          border: 'none',
        },
        success: {
          className: cn(
            theme === 'dark'
              ? 'bg-gradient-to-r from-[#3b82f6]/20 to-[#22c55e]/20 text-[#e5e7eb]'
              : 'bg-gradient-to-r from-[#1e40af]/20 to-[#15803d]/20 text-[#111827]'
          ),
        },
        error: {
          className: cn(
            theme === 'dark'
              ? 'bg-[#ef4444]/20 text-[#e5e7eb] border-[#ef4444]'
              : 'bg-[#b91c1c]/20 text-[#111827] border-[#b91c1c]'
          ),
        },
        loading: {
          className: cn(
            theme === 'dark'
              ? 'bg-[#374151]/20 text-[#e5e7eb]'
              : 'bg-[#e5e7eb]/20 text-[#111827]'
          ),
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
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
                    ? 'bg-gradient-to-r from-[#3b82f6]/20 to-[#22c55e]/20'
                    : 'bg-gradient-to-r from-[#1e40af]/20 to-[#15803d]/20'),
                t.type === 'error' &&
                  (theme === 'dark'
                    ? 'bg-[#ef4444]/20 border-[#ef4444]'
                    : 'bg-[#b91c1c]/20 border-[#b91c1c]'),
                t.type === 'loading' &&
                  (theme === 'dark' ? 'bg-[#374151]/20' : 'bg-[#e5e7eb]/20'),
                t.type === 'warning' &&
                  (theme === 'dark'
                    ? 'bg-[#f59e0b]/20 border-[#f59e0b]'
                    : 'bg-[#d97706]/20 border-[#d97706]')
              )}
            >
              {/* Custom Icon */}
              <div>
                {t.type === 'success' && (
                  <CheckCircle
                    className={cn(
                      'h-5 w-5',
                      theme === 'dark' ? 'text-[#22c55e]' : 'text-[#15803d]'
                    )}
                  />
                )}
                {t.type === 'error' && (
                  <XCircle
                    className={cn(
                      'h-5 w-5',
                      theme === 'dark' ? 'text-[#ef4444]' : 'text-[#b91c1c]'
                    )}
                  />
                )}
                {t.type === 'loading' && (
                  <Loader2
                    className={cn(
                      'h-5 w-5 animate-spin',
                      theme === 'dark' ? 'text-[#e5e7eb]' : 'text-[#111827]'
                    )}
                  />
                )}
                {t.type === 'warning' && (
                  <AlertTriangle
                    className={cn(
                      'h-5 w-5',
                      theme === 'dark' ? 'text-[#f59e0b]' : 'text-[#d97706]'
                    )}
                  />
                )}
              </div>

              {/* Message */}
              <div
                className={cn(
                  'flex-1 text-sm font-semibold',
                  theme === 'dark' ? 'text-[#e5e7eb]' : 'text-[#111827]'
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
                      ? 'text-[#9ca3af] hover:bg-[#4b5563]'
                      : 'text-[#6b7280] hover:bg-[#d1d5db]'
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