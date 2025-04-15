import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import Header from '@/components/layout/Header';
import { showToast } from '@/components/CustomToast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Register = () => {
  const { user, register } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    const toastId = showToast.loading('Registering...');
    setIsLoading(true);
    try {
      await register({
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
      });
      showToast.success('Registered successfully', { id: toastId });
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to register', {
        id: toastId,
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        theme === 'dark' ? 'bg-background-dark' : 'bg-background-light'
      )}
    >
      <Header />
      <main className="flex-grow flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <Card
            className={cn(
              'backdrop-blur-lg border',
              theme === 'dark'
                ? 'bg-card-dark/90 border-border-dark'
                : 'bg-card-light/90 border-border-light'
            )}
          >
            <CardHeader>
              <CardTitle
                className={cn(
                  'text-2xl font-extrabold text-center bg-clip-text text-transparent',
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-primary-dark to-secondary-dark'
                    : 'bg-gradient-to-r from-primary-light to-secondary-light'
                )}
              >
                Join SportsBuddy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <div>
                  <Label
                    htmlFor="name"
                    className={cn(
                      theme === 'dark' ? 'text-foreground-dark' : 'text-foreground-light'
                    )}
                  >
                    Name
                  </Label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Input
                      id="name"
                      type="text"
                      {...formRegister('name')}
                      className={cn(
                        'mt-1',
                        theme === 'dark'
                          ? 'bg-muted-dark border-border-dark text-foreground-dark focus:ring-primary-dark'
                          : 'bg-muted-light/50 border-border-light text-foreground-light focus:ring-primary-light'
                      )}
                      placeholder="John Doe"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={cn(
                          'mt-1 text-sm',
                          theme === 'dark' ? 'text-destructive-dark' : 'text-destructive-light'
                        )}
                      >
                        {errors.name.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Username Field */}
                <div>
                  <Label
                    htmlFor="username"
                    className={cn(
                      theme === 'dark' ? 'text-foreground-dark' : 'text-foreground-light'
                    )}
                  >
                    Username
                  </Label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Input
                      id="username"
                      type="text"
                      {...formRegister('username')}
                      className={cn(
                        'mt-1',
                        theme === 'dark'
                          ? 'bg-muted-dark border-border-dark text-foreground-dark focus:ring-primary-dark'
                          : 'bg-muted-light/50 border-border-light text-foreground-light focus:ring-primary-light'
                      )}
                      placeholder="johndoe123"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.username && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={cn(
                          'mt-1 text-sm',
                          theme === 'dark' ? 'text-destructive-dark' : 'text-destructive-light'
                        )}
                      >
                        {errors.username.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Email Field */}
                <div>
                  <Label
                    htmlFor="email"
                    className={cn(
                      theme === 'dark' ? 'text-foreground-dark' : 'text-foreground-light'
                    )}
                  >
                    Email
                  </Label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Input
                      id="email"
                      type="email"
                      {...formRegister('email')}
                      className={cn(
                        'mt-1',
                        theme === 'dark'
                          ? 'bg-muted-dark border-border-dark text-foreground-dark focus:ring-primary-dark'
                          : 'bg-muted-light/50 border-border-light text-foreground-light focus:ring-primary-light'
                      )}
                      placeholder="you@example.com"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={cn(
                          'mt-1 text-sm',
                          theme === 'dark' ? 'text-destructive-dark' : 'text-destructive-light'
                        )}
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password Field */}
                <div>
                  <Label
                    htmlFor="password"
                    className={cn(
                      theme === 'dark' ? 'text-foreground-dark' : 'text-foreground-light'
                    )}
                  >
                    Password
                  </Label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="relative"
                  >
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...formRegister('password')}
                      className={cn(
                        'mt-1 pr-10',
                        theme === 'dark'
                          ? 'bg-muted-dark border-border-dark text-foreground-dark focus:ring-primary-dark'
                          : 'bg-muted-light/50 border-border-light text-foreground-light focus:ring-primary-light'
                      )}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPassword ? (
                        <EyeOff
                          className={cn(
                            'h-5 w-5',
                            theme === 'dark' ? 'text-muted-foreground-dark' : 'text-muted-foreground-light'
                          )}
                        />
                      ) : (
                        <Eye
                          className={cn(
                            'h-5 w-5',
                            theme === 'dark' ? 'text-muted-foreground-dark' : 'text-muted-foreground-light'
                          )}
                        />
                      )}
                    </button>
                  </motion.div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={cn(
                          'mt-1 text-sm',
                          theme === 'dark' ? 'text-destructive-dark' : 'text-destructive-light'
                        )}
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit Button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      'w-full flex items-center space-x-2',
                      theme === 'dark'
                        ? 'bg-primary-dark hover:bg-primary-dark/80 text-foreground-light'
                        : 'bg-primary-light hover:bg-primary-light/80 text-foreground-dark'
                    )}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>{isLoading ? 'Registering...' : 'Register'}</span>
                  </Button>
                </motion.div>
              </form>

              {/* Login Link */}
              <p
                className={cn(
                  'mt-4 text-center text-sm',
                  theme === 'dark' ? 'text-foreground-dark' : 'text-foreground-light'
                )}
              >
                Already have an account?{' '}
                <Link
                  to="/login"
                  className={cn(
                    'font-semibold',
                    theme === 'dark'
                      ? 'text-accent-dark hover:text-accent-dark/80'
                      : 'text-accent-light hover:text-accent-light/80'
                  )}
                >
                  Log in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Register;