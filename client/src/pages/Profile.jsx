import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MapPin,
  Award,
  Edit,
  Save,
  X,
  Camera,
  Facebook,
  Twitter,
  Instagram,
  Dumbbell,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Zod schema for validation
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username cannot exceed 30 characters"),
  email: z.string().email("Please enter a valid email"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional().or(z.literal("")),
  location: z.object({
    city: z.string().optional().or(z.literal("")),
    state: z.string().optional().or(z.literal("")),
    country: z.string().optional().or(z.literal("")),
  }),
  socialLinks: z.object({
    facebook: z.string().optional().or(z.literal("")),
    twitter: z.string().optional().or(z.literal("")),
    instagram: z.string().optional().or(z.literal("")),
  }),
  sportsPreferences: z.array(
    z.object({
      sport: z.enum(["Football", "Basketball", "Tennis", "Running", "Cycling", "Swimming", "Volleyball", "Cricket", "Other"]),
      skillLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
    })
  ).optional(),
});

const achievementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().or(z.literal("")),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
});

const Profile = () => {
  const { user, updateProfile, addAchievement } = useAuth();
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSportDialog, setOpenSportDialog] = useState(false);
  const [openAchievementDialog, setOpenAchievementDialog] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      bio: "",
      location: { city: "", state: "", country: "" },
      socialLinks: { facebook: "", twitter: "", instagram: "" },
      sportsPreferences: [],
    },
  });

  const { fields: sportsFields, append: appendSport, remove: removeSport } = useFieldArray({
    control,
    name: "sportsPreferences",
  });

  const achievementForm = useForm({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  // Dynamically set page title
  useEffect(() => {
    document.title = `${user ? `${user.name}'s Profile` : "Profile"} - SportsBuddy`;
  }, []);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || { city: "", state: "", country: "" },
        socialLinks: user.socialLinks || { facebook: "", twitter: "", instagram: "" },
        sportsPreferences: user.sportsPreferences || [],
      });
      setAvatarPreview(user.avatar?.url || "/placeholder.svg");
    }
  }, [user, reset]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    const toastId = toast.loading("Updating profile...");
    try {
      const formData = new FormData();
      if (avatarFile) formData.append("avatar", avatarFile);
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, typeof value === "object" ? JSON.stringify(value) : value);
      });
      console.log("Submitting profile data:", data);
      console.log("FormData entries:", Array.from(formData.entries()));
      const response = await updateProfile(formData);

      if (response.error) {
        toast.error(response.error.message, { id: toastId });
        return;
      }
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(response.data.avatar?.url || "/placeholder.svg");
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAchievement = async (data) => {
    try {
      await addAchievement(data);
      achievementForm.reset();
      setOpenAchievementDialog(false);
      toast.success("Achievement added successfully");
    } catch (error) {
      toast.error("Failed to add achievement");
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light to-muted-light dark:from-background-dark dark:to-muted-dark py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Header Card */}
        <Card className="bg-card-light dark:bg-card-dark shadow-xl">
          <div className="h-48 bg-gradient-to-r from-primary-light/90 to-accent-light/90 dark:from-primary-dark/90 dark:to-accent-dark/90 relative">
            {editing ? (
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setEditing(false);
                    setAvatarFile(null);
                    setAvatarPreview(user.avatar?.url || "/placeholder.svg");
                    reset();
                  }}
                  disabled={loading}
                >
                  <X size={20} />
                </Button>
                <Button onClick={handleSubmit(onSubmit)} disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-white"></div>
                  ) : (
                    <Save size={20} />
                  )}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-4"
                onClick={() => setEditing(true)}
              >
                <Edit size={20} />
              </Button>
            )}
          </div>
          <CardContent className="relative pt-16 px-6">
            <div className="absolute -top-16 left-6">
              <div className="relative w-32 h-32">
                <div className="w-full h-full rounded-full border-4 border-card-light dark:border-card-dark overflow-hidden bg-muted-light dark:bg-muted-dark">
                  {editing ? (
                    <div className="relative w-full h-full group">
                      <img
                        src={avatarPreview}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera size={24} className="text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </div>
                  ) : (
                    <img
                      src={user.avatar?.url || "/placeholder.svg"}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="ml-44 flex items-center space-x-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                  {user.stats?.eventsCreated || 0}
                </div>
                <div className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                  Events Created
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                  {user.stats?.eventsParticipated || 0}
                </div>
                <div className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                  Events Joined
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                  {user.achievements?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                  Achievements
                </div>
              </div>
            </div>
            <div className="mt-6">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      className="mt-1"
                    />
                    {errors.name && <p className="text-destructive-light dark:text-destructive-dark text-sm">{errors.name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      {...register("username")}
                      className="mt-1"
                    />
                    {errors.username && <p className="text-destructive-light dark:text-destructive-dark text-sm">{errors.username.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      {...register("email")}
                      className="mt-1"
                    />
                    {errors.email && <p className="text-destructive-light dark:text-destructive-dark text-sm">{errors.email.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      {...register("bio")}
                      className="mt-1"
                      rows={3}
                    />
                    {errors.bio && <p className="text-destructive-light dark:text-destructive-dark text-sm">{errors.bio.message}</p>}
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">{user.name}</h1>
                  <p className="text-muted-foreground-light dark:text-muted-foreground-dark">@{user.username}</p>
                  {user.bio && <p className="mt-4 text-foreground-light dark:text-foreground-dark">{user.bio}</p>}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location & Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-card-light dark:bg-card-dark">
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="location.city">City</Label>
                    <Input
                      id="location.city"
                      {...register("location.city")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location.state">State</Label>
                    <Input
                      id="location.state"
                      {...register("location.state")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location.country">Country</Label>
                    <Input
                      id="location.country"
                      {...register("location.country")}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground-light dark:text-muted-foreground-dark">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>
                    {user.location?.city}
                    {user.location?.state && `, ${user.location.state}`}
                    {user.location?.country && `, ${user.location.country}`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card-light dark:bg-card-dark">
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="socialLinks.facebook">Facebook</Label>
                    <Input
                      id="socialLinks.facebook"
                      {...register("socialLinks.facebook")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="socialLinks.twitter">Twitter</Label>
                    <Input
                      id="socialLinks.twitter"
                      {...register("socialLinks.twitter")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="socialLinks.instagram">Instagram</Label>
                    <Input
                      id="socialLinks.instagram"
                      {...register("socialLinks.instagram")}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  {user.socialLinks?.facebook && (
                    <a
                      href={user.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
                    >
                      <Facebook size={20} />
                    </a>
                  )}
                  {user.socialLinks?.twitter && (
                    <a
                      href={user.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
                    >
                      <Twitter size={20} />
                    </a>
                  )}
                  {user.socialLinks?.instagram && (
                    <a
                      href={user.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
                    >
                      <Instagram size={20} />
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sports Preferences */}
        <Card className="bg-card-light dark:bg-card-dark">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Sports Preferences
              {editing && (
                <Button variant="outline" size="sm" onClick={() => setOpenSportDialog(true)}>
                  <Plus size={16} className="mr-2" /> Add Sport
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sportsFields.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {sportsFields.map((sport, index) => (
                  <div
                    key={sport.id}
                    className="bg-background-light dark:bg-background-dark rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Dumbbell className="w-5 h-5 text-primary-light dark:text-primary-dark mr-3" />
                      <div>
                        <h3 className="font-medium text-foreground-light dark:text-foreground-dark">{sport.sport}</h3>
                        <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                          {sport.skillLevel}
                        </p>
                      </div>
                    </div>
                    {editing && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSport(index)}
                        className="text-destructive-light dark:text-destructive-dark"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                  No sports preferences added yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sports Preference Dialog */}
        <Dialog open={openSportDialog} onOpenChange={setOpenSportDialog}>
          <DialogContent className="bg-card-light dark:bg-card-dark">
            <DialogHeader>
              <DialogTitle>Add Sport Preference</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sport">Sport</Label>
                <Select
                  onValueChange={(value) => appendSport({ sport: value, skillLevel: "Beginner" })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Football", "Basketball", "Tennis", "Running", "Cycling", "Swimming", "Volleyball", "Cricket", "Other"].map((sport) => (
                      <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="skillLevel">Skill Level</Label>
                <Select
                  onValueChange={(value) => {
                    const lastIndex = sportsFields.length - 1;
                    if (lastIndex >= 0) {
                      sportsFields[lastIndex].skillLevel = value;
                    }
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Beginner", "Intermediate", "Advanced"].map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenSportDialog(false)}>Cancel</Button>
              <Button
                onClick={() => setOpenSportDialog(false)}
                disabled={!sportsFields.length || !sportsFields[sportsFields.length - 1]?.sport}
              >
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Achievements */}
        <Card className="bg-card-light dark:bg-card-dark">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Achievements
              {!editing && (
                <Button variant="outline" size="sm" onClick={() => setOpenAchievementDialog(true)}>
                  <Plus size={16} className="mr-2" /> Add Achievement
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.achievements && user.achievements.length > 0 ? (
              <div className="space-y-4">
                {user.achievements.map((achievement, index) => (
                  <div key={index} className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                    <div className="flex items-start">
                      <Award className="w-6 h-6 text-primary-light dark:text-primary-dark mr-3 mt-1" />
                      <div>
                        <h3 className="font-medium text-foreground-light dark:text-foreground-dark">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                          {format(new Date(achievement.date), "MMMM dd, yyyy")}
                        </p>
                        {achievement.description && (
                          <p className="text-foreground-light dark:text-foreground-dark">{achievement.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground-light dark:text-muted-foreground-dark">No achievements added yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievement Dialog */}
        <Dialog open={openAchievementDialog} onOpenChange={setOpenAchievementDialog}>
          <DialogContent className="bg-card-light dark:bg-card-dark">
            <DialogHeader>
              <DialogTitle>Add Achievement</DialogTitle>
            </DialogHeader>
            <form onSubmit={achievementForm.handleSubmit(handleAddAchievement)} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...achievementForm.register("title")}
                  className="mt-1"
                />
                {achievementForm.formState.errors.title && (
                  <p className="text-destructive-light dark:text-destructive-dark text-sm">
                    {achievementForm.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...achievementForm.register("description")}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  {...achievementForm.register("date")}
                  className="mt-1"
                />
                {achievementForm.formState.errors.date && (
                  <p className="text-destructive-light dark:text-destructive-dark text-sm">
                    {achievementForm.formState.errors.date.message}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenAchievementDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={achievementForm.formState.isSubmitting}>Add</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Profile;