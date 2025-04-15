import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import Header from '../components/layout/Header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// Zod schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const { user, login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data);
      toast.success('Logged in successfully!');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark"
    >
      <Header />
      <main className="flex-grow flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card
            className="backdrop-blur-lg border bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark shadow-2xl"
          >
            <CardHeader>
              <CardTitle
                className="text-2xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark"
              >
                Login to SportsBuddy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email */}
                <div>
                  <Label
                    htmlFor="email"
                    className="text-foreground-light dark:text-foreground-dark"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="mt-1 bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark border-border-light dark:border-border-dark "
                    placeholder="you@example.com"
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-1 text-sm text-destructive-light dark:text-destructive-dark"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password */}
                <div>
                  <Label
                    htmlFor="password"
                    className="text-foreground-light dark:text-foreground-dark"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className="bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark border-border-light dark:border-border-dark "
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPassword ? (
                        <EyeOff
                          className="h-5 w-5 text-muted-foreground-light dark:text-muted-foreground-dark"
                        />
                      ) : (
                        <Eye
                          className="h-5 w-5 text-muted-foreground-light dark:text-muted-foreground-dark"
                        />
                      )}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-1 text-sm text-destructive-light dark:text-destructive-dark"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center space-x-2 bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-light/80 dark:to-secondary-light/80 text-foreground-light dark:text-foreground-dark"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{isLoading ? 'Logging in...' : 'Log In'}</span>
                  </Button>
                </motion.div>
              </form>

              {/* Sign up link */}
              <p
                className="mt-4 text-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark"
              >
                Don’t have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-accent-light dark:text-accent-dark hover:text-accent-light/80 dark:hover:text-accent-dark/80"
                >
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Login;
