import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import RegisterForm from '@/components/auth/RegisterForm';
import { cn } from '@/lib/utils';


const Register = () => {
  const { user } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);



  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        'bg-background-light dark:bg-background-dark'
      )}
    >
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
              'bg-card-light/90 border-border-light dark:bg-card-dark/90 dark:border-border-dark'
            )}
          >
            <CardHeader>
              <CardTitle
                className={cn(
                  'text-2xl font-extrabold text-center bg-clip-text text-transparent',
                  'bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark'
                )}
              >
                Join SportsBuddy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RegisterForm />
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Register;