import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import {
  User,
  MapPin,
  Medal,
  Edit,
  Bell,
  Facebook,
  Twitter,
  Instagram,
  Award,
} from "lucide-react";

const UserProfileCard = () => {
  const { user, notifications, updateProfile, markNotificationRead, addAchievement } = useAuth();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    location: {
      city: user?.location?.city || "",
      state: user?.location?.state || "",
      country: user?.location?.country || "",
    },
    socialLinks: {
      facebook: user?.socialLinks?.facebook || "",
      twitter: user?.socialLinks?.twitter || "",
      instagram: user?.socialLinks?.instagram || "",
    },
    sportsPreferences: user?.sportsPreferences || [],
  });
  const [newAchievement, setNewAchievement] = useState({
    title: "",
    description: "",
  });

  const handleProfileUpdate = async () => {
    try {
      await updateProfile(profileData);
      setShowEditDialog(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleAddAchievement = async () => {
    try {
      await addAchievement(newAchievement);
      setShowAchievementDialog(false);
      setNewAchievement({ title: "", description: "" });
    } catch (error) {
      console.error("Failed to add achievement:", error);
    }
  };

  const sportsList = [
    "Football",
    "Basketball",
    "Tennis",
    "Running",
    "Cycling",
    "Swimming",
    "Volleyball",
    "Cricket",
  ];

  const skillLevels = ["Beginner", "Intermediate", "Advanced"];

  const addSportPreference = (sport, level) => {
    setProfileData(prev => ({
      ...prev,
      sportsPreferences: [...prev.sportsPreferences, { sport, skillLevel: level }]
    }));
  };

  const removeSportPreference = (index) => {
    setProfileData(prev => ({
      ...prev,
      sportsPreferences: prev.sportsPreferences.filter((_, i) => i !== index)
    }));
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
      <div className="relative h-32 bg-gradient-to-r from-[#4CAF50] to-[#2E7D32]">
        <div className="absolute -bottom-16 left-8">
          <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-800">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`}
              alt={user?.name}
              className="w-full h-full object-cover"
            />
          </Avatar>
        </div>
      </div>

      <div className="pt-20 px-8 pb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">@{user?.username}</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label>Name</label>
                    <Input
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <label>Bio</label>
                    <Input
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, bio: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label>City</label>
                      <Input
                        value={profileData.location.city}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            location: { ...prev.location, city: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label>State</label>
                      <Input
                        value={profileData.location.state}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            location: { ...prev.location, state: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label>Country</label>
                      <Input
                        value={profileData.location.country}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            location: { ...prev.location, country: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label>Sports Preferences</label>
                    <div className="flex flex-wrap gap-2">
                      {profileData.sportsPreferences.map((pref, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1"
                        >
                          <span>
                            {pref.sport} - {pref.skillLevel}
                          </span>
                          <button
                            onClick={() => removeSportPreference(index)}
                            className="ml-2 text-red-500"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={(sport) =>
                          addSportPreference(sport, "Beginner")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Sport" />
                        </SelectTrigger>
                        <SelectContent>
                          {sportsList.map((sport) => (
                            <SelectItem key={sport} value={sport}>
                              {sport}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        onValueChange={(level) =>
                          setProfileData((prev) => ({
                            ...prev,
                            sportsPreferences: prev.sportsPreferences.map((p, i) =>
                              i === prev.sportsPreferences.length - 1
                                ? { ...p, skillLevel: level }
                                : p
                            ),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Skill Level" />
                        </SelectTrigger>
                        <SelectContent>
                          {skillLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label>Social Links</label>
                    <div className="grid gap-4">
                      <div className="flex items-center gap-2">
                        <Facebook className="w-5 h-5" />
                        <Input
                          placeholder="Facebook URL"
                          value={profileData.socialLinks.facebook}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              socialLinks: {
                                ...prev.socialLinks,
                                facebook: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Twitter className="w-5 h-5" />
                        <Input
                          placeholder="Twitter URL"
                          value={profileData.socialLinks.twitter}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              socialLinks: {
                                ...prev.socialLinks,
                                twitter: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Instagram className="w-5 h-5" />
                        <Input
                          placeholder="Instagram URL"
                          value={profileData.socialLinks.instagram}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              socialLinks: {
                                ...prev.socialLinks,
                                instagram: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate}>Save Changes</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showNotificationsDialog} onOpenChange={setShowNotificationsDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="ml-1 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      {notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Notifications</DialogTitle>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-gray-500">No notifications</p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 border-b last:border-b-0 ${
                          notification.read ? "opacity-60" : ""
                        }`}
                        onClick={() => markNotificationRead(notification._id)}
                      >
                        <p className="font-medium">{notification.message}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">{user?.bio}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
              <User className="w-5 h-5" />
              <span>Member since {new Date(user?.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
              <MapPin className="w-5 h-5" />
              <span>
                {user?.location?.city}, {user?.location?.state},{" "}
                {user?.location?.country}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {user?.socialLinks && (
              <div className="flex space-x-4">
                {user.socialLinks.facebook && (
                  <a
                    href={user.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {user.socialLinks.twitter && (
                  <a
                    href={user.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-500"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {user.socialLinks.instagram && (
                  <a
                    href={user.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Sports Preferences</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user?.sportsPreferences?.map((pref, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <h4 className="font-semibold">{pref.sport}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {pref.skillLevel}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Achievements</h3>
            <Dialog open={showAchievementDialog} onOpenChange={setShowAchievementDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Award className="w-4 h-4 mr-2" />
                  Add Achievement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Achievement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label>Title</label>
                    <Input
                      value={newAchievement.title}
                      onChange={(e) =>
                        setNewAchievement((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label>Description</label>
                    <Input
                      value={newAchievement.description}
                      onChange={(e) =>
                        setNewAchievement((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button onClick={handleAddAchievement}>Add Achievement</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user?.achievements?.map((achievement, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center space-x-2">
                  <Medal className="w-5 h-5 text-yellow-500" />
                  <h4 className="font-semibold">{achievement.title}</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {achievement.description}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(achievement.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserProfileCard;
