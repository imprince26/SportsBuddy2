import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
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
import { Textarea } from '@/components/ui/textarea';
import {
    User,
    Trophy,
    Save,
    Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import MultiSelect from '@/components/ui/multi-select'; // Assume you have a custom multi-select

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
    bio: z.string().max(200, 'Bio cannot exceed 200 characters').optional(),
    location: z.object({
        city: z.string().max(50).optional(),
        state: z.string().max(50).optional(),
        country: z.string().max(50).optional(),
    }),
    sportsPreferences: z.array(z.object({
        sport: z
            .array(z.enum([
                "Football", "Basketball", "Tennis", "Running", "Cycling", "Swimming", "Volleyball", "Cricket", "Other"
            ]))
            .max(3, 'You can select up to 3 sports')
            .optional(),
        skillLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    })),
});

const EditProfileForm = (setAvatar) => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [avatar, setAvatarPreview] = useState(null);

    const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            username: user?.username || '',
            bio: user?.bio || '',
            location: {
                city: user?.location?.city || '',
                state: user?.location?.state || '',
                country: user?.location?.country || '',
            },
            sportsPreferences: user?.sportsPreferences || [
                { sport: [], skillLevel: "Beginner" }
            ],
        },
        mode: 'onChange',
    });

    const { fields, append, remove } = useFieldArray({
        control: profileForm.control,
        name: "sportsPreferences"
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
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

    const sportsOptions = [
        "Football", "Basketball", "Tennis", "Running",
        "Cycling", "Swimming", "Volleyball", "Cricket", "Other"
    ];

    const skillLevels = ["Beginner", "Intermediate", "Advanced"];

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
                    name="location.city"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={cn('text-foreground-light dark:text-foreground-dark')}>
                                City
                            </FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="City" disabled={isLoading}
                                    className={cn('bg-muted-light/30 dark:bg-muted-dark/30 border-border-light dark:border-border-dark',
                                        'text-foreground-light dark:text-foreground-dark')} />
                            </FormControl>
                            <FormMessage className={cn('text-destructive-light dark:text-destructive-dark')} />
                        </FormItem>
                    )}
                />

                <FormField
                    control={profileForm.control}
                    name="location.state"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={cn('text-foreground-light dark:text-foreground-dark')}>
                                State
                            </FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="State" disabled={isLoading}
                                    className={cn('bg-muted-light/30 dark:bg-muted-dark/30 border-border-light dark:border-border-dark',
                                        'text-foreground-light dark:text-foreground-dark')} />
                            </FormControl>
                            <FormMessage className={cn('text-destructive-light dark:text-destructive-dark')} />
                        </FormItem>
                    )}
                />

                <FormField
                    control={profileForm.control}
                    name="location.country"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={cn('text-foreground-light dark:text-foreground-dark')}>
                                Country
                            </FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Country" disabled={isLoading}
                                    className={cn('bg-muted-light/30 dark:bg-muted-dark/30 border-border-light dark:border-border-dark',
                                        'text-foreground-light dark:text-foreground-dark')} />
                            </FormControl>
                            <FormMessage className={cn('text-destructive-light dark:text-destructive-dark')} />
                        </FormItem>
                    )}
                />

                {/* sportsPreferences array field */}
                {fields.map((item, index) => (
                    <div key={item.id} className="space-y-4 border p-4 rounded-2xl border-border-light dark:border-border-dark">
                        <FormField
                            control={profileForm.control}
                            name={`sportsPreferences.${index}.sport`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={cn('text-foreground-light dark:text-foreground-dark')}>
                                        Select Sports (max 3)
                                    </FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={sportsOptions}
                                            value={field.value || []}
                                            onChange={field.onChange}
                                            maxSelected={3}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage className={cn('text-destructive-light dark:text-destructive-dark')} />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={profileForm.control}
                            name={`sportsPreferences.${index}.skillLevel`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={cn('text-foreground-light dark:text-foreground-dark')}>
                                        Skill Level
                                    </FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger
                                                className={cn('bg-muted-light/30 dark:bg-muted-dark/30 border-border-light dark:border-border-dark',
                                                    'text-foreground-light dark:text-foreground-dark')}
                                            >
                                                <SelectValue placeholder="Select skill level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {skillLevels.map((level) => (
                                                    <SelectItem key={level} value={level}>
                                                        {level}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage className={cn('text-destructive-light dark:text-destructive-dark')} />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => remove(index)}
                            className="text-sm"
                        >
                            Remove Preference
                        </Button>
                    </div>
                ))}

                <Button
                    type="button"
                    onClick={() => append({ sport: [], skillLevel: "Beginner" })}
                    className={cn(
                        'bg-primary-light dark:bg-primary-dark hover:bg-primary-light/80 dark:hover:bg-primary-dark/80',
                        'text-foreground-dark dark:text-foreground-light'
                    )}
                >
                    + Add Sport Preference
                </Button>

                {/* Avatar upload */}
                <div>
                    <FormLabel className={cn('text-foreground-light dark:text-foreground-dark')}>
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

                {/* Submit button */}
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
    );
};

export default EditProfileForm;
