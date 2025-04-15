import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { showToast } from '@/components/CustomToast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import {
  User,
  Trophy,
  Save,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/utils/api';

// Zod schema
const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name cannot exceed 50 characters')
    .regex(/^[A-Za-z\s]+$/, 'Full name can only contain letters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(200, 'Bio cannot exceed 200 characters').optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      'Password must include uppercase, lowercase, number, and special character'
    ),
});

const Profile = () => {
  const { user, updateUser, changePassword } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Profile Form
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
    },
    mode: 'onChange',
  });

  // Password Form
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
    mode: 'onChange',
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onProfileSubmit = async (data) => {
    setIsLoading(true);
    const toastId = showToast.loading('Updating profile...');
    try {
      await updateUser({ ...data, avatar });
      showToast.success('Profile updated successfully!', { id: toastId });
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to update profile', {
        id: toastId,
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setIsLoading(true);
    const toastId = showToast.loading('Changing password...');
    try {
      await changePassword(data.currentPassword, data.newPassword);
      showToast.success('Password changed successfully!', { id: toastId });
      passwordForm.reset();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to change password', {
        id: toastId,
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock achievements
  const achievements = [
    { id: 1, name: 'First Event', icon: Trophy },
    // { id: 2, name: 'Team Leader', icon: Users },
    { id: 3, name: 'Marathon Finisher', icon: Trophy },
  ];

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        'bg-background-light dark:bg-background-dark'
      )}
    >
      <main className="flex-grow container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div>
              <Card
                className={cn(
                  'border',
                  'bg-card-light/90 border-border-light dark:bg-card-dark/90 dark:border-border-dark'
                )}
              >
                <CardContent className="p-6 text-center">
                  <motion.img
                    src={avatar}
                    alt="User avatar"
                    className="w-32 h-32 rounded-full mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    loading="lazy"
                  />
                  <h2
                    className={cn(
                      'text-2xl font-bold',
                      'text-foreground-light dark:text-foreground-dark'
                    )}
                  >
                    {user?.name}
                  </h2>
                  <p
                    className={cn(
                      'text-sm',
                      'text-muted-foreground-light dark:text-muted-foreground-dark'
                    )}
                  >
                    @{user?.username}
                  </p>
                  <p
                    className={cn(
                      'mt-2',
                      'text-foreground-light dark:text-foreground-dark'
                    )}
                  >
                    {user?.bio || 'No bio yet.'}
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    <p
                      className={cn(
                        'text-sm',
                        'text-muted-foreground-light dark:text-muted-foreground-dark'
                      )}
                    >
                      <span className="font-semibold">10</span> Events
                    </p>
                    <p
                      className={cn(
                        'text-sm',
                        'text-muted-foreground-light dark:text-muted-foreground-dark'
                      )}
                    >
                      <span className="font-semibold">5</span> Teams
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile & Password Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Form */}
              <Card
                className={cn(
                  'border',
                  'bg-card-light/90 border-border-light dark:bg-card-dark/90 dark:border-border-dark'
                )}
              >
                <CardHeader>
                  <CardTitle
                    className={cn(
                      'text-2xl',
                      'text-foreground-light dark:text-foreground-dark'
                    )}
                  >
                    Edit Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form
                      onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              className={cn(
                                'text-foreground-light dark:text-foreground-dark'
                              )}
                            >
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="John Doe"
                                disabled={isLoading}
                                className={cn(
                                  'bg-muted-light/30 dark:bg-muted-dark/30 border-border-light dark:border-border-dark',
                                  'text-foreground-light dark:text-foreground-dark'
                                )}
                              />
                            </FormControl>
                            <FormMessage
                              className={cn(
                                'text-destructive-light dark:text-destructive-dark'
                              )}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              className={cn(
                                'text-foreground-light dark:text-foreground-dark'
                              )}
                            >
                              Username
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="johndoe123"
                                disabled={isLoading}
                                className={cn(
                                  'bg-muted-light/30 dark:bg-muted-dark/30 border-border-light dark:border-border-dark',
                                  'text-foreground-light dark:text-foreground-dark'
                                )}
                              />
                            </FormControl>
                            <FormMessage
                              className={cn(
                                'text-destructive-light dark:text-destructive-dark'
                              )}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              className={cn(
                                'text-foreground-light dark:text-foreground-dark'
                              )}
                            >
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="you@example.com"
                                disabled={isLoading}
                                className={cn(
                                  'bg-muted-light/30 dark:bg-muted-dark/30 border-border-light dark:border-border-dark',
                                  'text-foreground-light dark:text-foreground-dark'
                                )}
                              />
                            </FormControl>
                            <FormMessage
                              className={cn(
                                'text-destructive-light dark:text-destructive-dark'
                              )}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              className={cn(
                                'text-foreground-light dark:text-foreground-dark'
                              )}
                            >
                              Bio
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Tell us about yourself"
                                disabled={isLoading}
                                className={cn(
                                  'bg-muted-light/30 dark:bg-muted-dark/30 border-border-light dark:border-border-dark',
                                  'text-foreground-light dark:text-foreground-dark'
                                )}
                              />
                            </FormControl>
                            <FormMessage
                              className={cn(
                                'text-destructive-light dark:text-destructive-dark'
                              )}
                            />
                          </FormItem>
                        )}
                      />
                      <div>
                        <FormLabel
                          className={cn(
                            'text-foreground-light dark:text-foreground-dark'
                          )}
                        >
                          Avatar
                        </FormLabel>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          disabled={isLoading}
                          className={cn(
                            'mt-1',
                            'bg-muted-light/30 dark:bg-muted-dark/30 border-border-light dark:border-border-dark',
                            'text-foreground-light dark:text-foreground-dark'
                          )}
                        />
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          type="submit"
                          disabled={isLoading || !profileForm.formState.isValid}
                          className={cn(
                            'w-full',
                            'bg-primary-light dark:bg-primary-dark hover:bg-primary-light/80 dark:hover:bg-primary-dark/80',
                            'text-foreground-dark dark:text-foreground-light'
                          )}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Profile
                        </Button>
                      </motion.div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Password Form */}
              <Card
                className={cn(
                  'border',
                  'bg-card-light/90 border-border-light dark:bg-card-dark/90 dark:border-border-dark'
                )}
              >
                <CardHeader>
                  <CardTitle
                    className={cn(
                      'text-2xl',
                      'text-foreground-light dark:text-foreground-dark'
                    )}
                  >
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form
                      onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              className={cn(
                                'text-foreground-light dark:text-foreground-dark'
                              )}
                            >
                              Current Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="••••••••"
                                disabled={isLoading}
                                className={cn(
                                  'bg-muted-light/30 dark:bg-muted-dark/30 border-border-light dark:border-border-dark',
                                  'text-foreground-light dark:text-foreground-dark'
                                )}
                              />
                            </FormControl>
                            <FormMessage
                              className={cn(
                                'text-destructive-light dark:text-destructive-dark'
                              )}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              className={cn(
                                'text-foreground-light dark:text-foreground-dark'
                              )}
                            >
                              New Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="••••••••"
                                disabled={isLoading}
                                className={cn(
                                  'bg-muted-light/30 dark:bg-muted-dark/30 border-border-light dark:border-border-dark',
                                  'text-foreground-light dark:text-foreground-dark'
                                )}
                              />
                            </FormControl>
                            <FormMessage
                              className={cn(
                                'text-destructive-light dark:text-destructive-dark'
                              )}
                            />
                          </FormItem>
                        )}
                      />
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          type="submit"
                          disabled={isLoading || !passwordForm.formState.isValid}
                          className={cn(
                            'w-full',
                            'bg-primary-light dark:bg-primary-dark hover:bg-primary-light/80 dark:hover:bg-primary-dark/80',
                            'text-foreground-dark dark:text-foreground-light'
                          )}
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                      </motion.div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card
                className={cn(
                  'border',
                  'bg-card-light/90 border-border-light dark:bg-card-dark/90 dark:border-border-dark'
                )}
              >
                <CardHeader>
                  <CardTitle
                    className={cn(
                      'text-2xl',
                      'text-foreground-light dark:text-foreground-dark'
                    )}
                  >
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className={cn(
                          'flex items-center p-4 rounded-md',
                          'bg-muted-light/50 dark:bg-muted-dark/50'
                        )}
                      >
                        <achievement.icon
                          className={cn(
                            'h-8 w-8 mr-4',
                            'text-accent-light dark:text-accent-dark'
                          )}
                        />
                        <p
                          className={cn(
                            'font-semibold',
                            'text-foreground-light dark:text-foreground-dark'
                          )}
                        >
                          {achievement.name}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;