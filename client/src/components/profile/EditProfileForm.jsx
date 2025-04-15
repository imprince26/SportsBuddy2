import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/components/CustomToast';

// import{
//   select,
//   SelectGroup,
//   SelectValue,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectSeparator
// } from '@/components/ui/select';
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
  location: z.object({
    city: z.string().max(50, 'City cannot exceed 50 characters').optional(),
    state: z.string().max(50, 'State cannot exceed 50 characters').optional(),
    country: z.string().max(50, 'Country cannot exceed 50 characters').optional(),
  }),
  sportsPreferences: z.array(z.object({
    sport: z.array(z.string()).max(3, 'You can select up to 3 sports').optional(),
    skillLevel: z.string().optional(),
  })),
});

const EditProfileForm = (setAvatar) => {
     const { user, updateProfile, updatePassword } = useAuth();
      const navigate = useNavigate();
      const [isLoading, setIsLoading] = useState(false);

      const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
          name: user?.name || '',
          username: user?.username || '',
          bio: user?.bio || '',
          email: user?.email || '',
          location: {
            city: user?.location?.city || '',
            state: user?.location?.state || '',
            country: user?.location?.country || '',
          },
          sportsPreferences: user?.sportsPreferences || [],
          socialLinks: {
            facebook: user?.socialLinks?.facebook || '',
            twitter: user?.socialLinks?.twitter || '',
            instagram: user?.socialLinks?.instagram || '',
          }
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
            await updateProfile({ ...data, avatar });
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
  return (
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
                         <FormField
                           control={profileForm.control}
                           name="location"
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel
                                 className={cn(
                                   'text-foreground-light dark:text-foreground-dark'
                                 )}
                               >
                                 Location
                               </FormLabel>
                               <FormControl>
                                 <Input
                                   {...field}
                                   placeholder="New York, USA"
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
  )
}

export default EditProfileForm
