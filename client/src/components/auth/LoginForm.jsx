import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { showToast } from '@/components/CustomToast';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
  // .regex(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
  //   'Password must include uppercase, lowercase, number, and special character'
  // ),
});

const LoginForm = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputStates, setInputStates] = useState({
    email: { value: '', isFocused: false, hasContent: false },
    password: { value: '', isFocused: false, hasContent: false },
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const handleInputChange = (name, value) => {
    setInputStates((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        hasContent: value.length > 0,
      },
    }));
  };

  const handleInputFocus = (name, isFocused) => {
    setInputStates((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        isFocused,
      },
    }));
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
    const res =  await login({
        email: data.email,
        password: data.password,
      });
      console.log('Login response:', res);

      if (res.success) {
        showToast.success('Login successful');
        navigate('/dashboard');
      }
    } catch (error) {
      showToast.error(error.message || 'Login failed');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={cn(
                    'text-foreground-light dark:text-foreground-dark transition-all duration-300',
                    inputStates.email.isFocused ? 'text-secondary-light dark:text-secondary-dark' : ''
                  )}
                  htmlFor="email"
                >
                  Email Address
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Mail
                      className={cn(
                        'absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300',
                        inputStates.email.isFocused
                          ? 'text-secondary-light dark:text-secondary-dark scale-110'
                          : 'text-muted-foreground-light dark:text-muted-foreground-dark'
                      )}
                      size={20}
                    />
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      disabled={isLoading}
                      onFocus={() => handleInputFocus('email', true)}
                      onBlur={() => handleInputFocus('email', false)}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange('email', e.target.value);
                      }}
                      autoComplete="email"
                      className={cn(
                        'pl-10 pr-3 bg-muted-light/30 dark:bg-muted-dark/30 border-border-light dark:border-border-dark',
                        'text-foreground-light dark:text-foreground-dark placeholder-muted-foreground-light dark:placeholder-muted-foreground-dark',
                        'disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-0',
                        inputStates.email.isFocused
                          ? 'ring-2 ring-secondary-light/50 dark:ring-secondary-dark/50 border-secondary-light/70 dark:border-secondary-dark/70'
                          : 'hover:border-secondary-light dark:hover:border-secondary-dark',
                        inputStates.email.hasContent ? 'border-secondary-light dark:border-secondary-dark' : ''
                      )}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-destructive-light dark:text-destructive-dark text-sm" />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={cn(
                    'text-foreground-light dark:text-foreground-dark transition-all duration-300',
                    inputStates.password.isFocused ? 'text-secondary-light dark:text-secondary-dark' : ''
                  )}
                  htmlFor="password"
                >
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Lock
                      className={cn(
                        'absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300',
                        inputStates.password.isFocused
                          ? 'text-secondary-light dark:text-secondary-dark scale-110'
                          : 'text-muted-foreground-light dark:text-muted-foreground-dark'
                      )}
                      size={20}
                    />
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      disabled={isLoading}
                      onFocus={() => handleInputFocus('password', true)}
                      onBlur={() => handleInputFocus('password', false)}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange('password', e.target.value);
                      }}
                      autoComplete="current-password"
                      className={cn(
                        'pl-10 pr-10 bg-muted-light/30 dark:bg-muted-dark/30 border-border-light dark:border-border-dark',
                        'text-foreground-light dark:text-foreground-dark placeholder-muted-foreground-light dark:placeholder-muted-foreground-dark',
                        'disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-0',
                        inputStates.password.isFocused
                          ? 'ring-2 ring-secondary-light/50 dark:ring-secondary-dark/50 border-secondary-light/70 dark:border-secondary-dark/70'
                          : 'hover:border-secondary-light dark:hover:border-secondary-dark',
                        inputStates.password.hasContent ? 'border-secondary-light dark:border-secondary-dark' : ''
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isLoading}
                      onClick={() => setShowPassword(!showPassword)}
                      className={cn(
                        'absolute right-1 top-1/2 -translate-y-1/2',
                        'text-muted-foreground-light dark:text-muted-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark',
                        'hover:text-secondary-light dark:hover:text-secondary-dark disabled:opacity-50'
                      )}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage className="text-destructive-light dark:text-destructive-dark text-sm" />
                {/* <p className="text-xs text-success-light dark:text-success-dark mt-1">
                          Password must contain at least 6 characters, including uppercase, lowercase, number, and special character
                        </p> */}
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              className={cn(
                'w-full flex items-center justify-center gap-2',
                'bg-gradient-to-r from-primary-light dark:from-primary-dark to-secondary-light dark:to-secondary-dark',
                'text-foreground-light dark:text-foreground-dark font-semibold tracking-wide',
                'shadow-md hover:shadow-lg transition-all duration-300',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              disabled={isLoading || !form.formState.isValid}
            >
              {isLoading ? (
                <>
                  <span className="animate-pulse">Logging in...</span>
                  <div className="h-4 w-4 border-2 border-foreground-dark dark:border-foreground-light border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                <>
                  Log In
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <p
          className={cn(
            'text-sm',
            'text-foreground-light dark:text-foreground-dark'
          )}
        >
          Don’t have an account?{' '}
          <Button
            variant="link"
            disabled={isLoading}
            className={cn(
              'text-accent-light dark:text-accent-dark hover:text-accent-light/80 dark:hover:text-accent-dark/80',
              'disabled:opacity-50'
            )}
            onClick={() => navigate('/register')}
          >
            Sign up
          </Button>
        </p>
      </div>
    </>
  );
};

export default LoginForm;
