import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  Lock,
  Globe,
  Loader2,
  Image as ImageIcon,
  MapPin,
  FileText,
  Settings,
  Save,
  Eye,
  AlertCircle,
  Info
} from 'lucide-react';
import { useCommunity } from '@/hooks/useCommunity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const SPORTS_CATEGORIES = [
  'Football',
  'Basketball',
  'Tennis',
  'Running',
  'Cycling',
  'Swimming',
  'Volleyball',
  'Cricket',
  'General',
  'Other'
];

const EditCommunity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchCommunity, updateCommunity, loading, currentCommunity } = useCommunity();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: {
      city: '',
      state: '',
      country: ''
    },
    isPrivate: false,
    settings: {
      allowMemberPosts: true,
      allowMemberEvents: true,
      autoApproveMembers: false
    },
    rules: ['']
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [errors, setErrors] = useState({});
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const loadCommunity = async () => {
      const community = await fetchCommunity(id);
      if (community) {
        setFormData({
          name: community.name || '',
          description: community.description || '',
          category: community.category || '',
          location: community.location || {
            city: '',
            state: '',
            country: ''
          },
          isPrivate: community.isPrivate || false,
          settings: community.settings || {
            allowMemberPosts: true,
            allowMemberEvents: true,
            autoApproveMembers: false
          },
          rules: community.rules && community.rules.length > 0 ? community.rules : ['']
        });
        if (community.image?.url) {
          setImagePreview(community.image.url);
        }
      }
      setInitializing(false);
    };
    loadCommunity();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLocationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleSettingChange = (setting, value) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: value
      }
    }));
  };

  const handleRuleChange = (index, value) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData(prev => ({ ...prev, rules: newRules }));
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, '']
    }));
  };

  const removeRule = (index) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image must be less than 5MB' }));
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, image: '' }));
      setImageRemoved(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Community name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    const validRules = formData.rules.filter(r => r.trim());
    if (validRules.length === 0) {
      newErrors.rules = 'At least one community rule is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      rules: formData.rules.filter(r => r.trim())
    };

    if (imageRemoved && !imageFile) {
      submitData.removeImage = true;
    }

    if (imageFile) {
      submitData.image = imageFile;
    }

    const result = await updateCommunity(id, submitData);

    if (result.success) {
      navigate(`/community/${id}`);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pb-24">
      <div className="border-b border-border/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Community
                </h1>
                <p className="text-sm text-muted-foreground">
                  {formData.name || 'Update your community settings'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/community/${id}`)}
                className="hidden sm:flex gap-2 rounded-xl"
              >
                <Eye className="w-4 h-4" />
                View
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                Basic Information
              </CardTitle>
              <CardDescription>Essential details about your community</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label className="text-base font-semibold">Community Image</Label>
                <p className="text-sm text-muted-foreground mb-3">Upload a cover image for your community</p>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <label className="p-3 bg-white rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                          <Upload className="w-5 h-5 text-gray-700" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary/30 rounded-2xl cursor-pointer bg-primary/5 hover:bg-primary/10 transition group">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-8 h-8 text-primary" />
                      </div>
                      <span className="font-medium text-primary">Click to upload image</span>
                      <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  {errors.image && (
                    <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.image}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="name" className="text-base font-semibold">
                  Community Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter a unique name for your community"
                  maxLength={100}
                  className={cn(
                    "mt-2 rounded-xl border-border/50 h-12",
                    errors.name && "border-red-500"
                  )}
                />
                <div className="flex justify-between mt-2">
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                  <p className={cn(
                    "text-xs ml-auto",
                    formData.name.length > 90 ? "text-amber-500" : "text-muted-foreground"
                  )}>
                    {formData.name.length}/100
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-semibold">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what your community is about..."
                  maxLength={500}
                  rows={4}
                  className={cn(
                    "mt-2 rounded-xl border-border/50 resize-none",
                    errors.description && "border-red-500"
                  )}
                />
                <div className="flex justify-between mt-2">
                  {errors.description && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                  <p className={cn(
                    "text-xs ml-auto",
                    formData.description.length > 450 ? "text-amber-500" : "text-muted-foreground"
                  )}>
                    {formData.description.length}/500
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="category" className="text-base font-semibold">
                  Category <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-muted-foreground mb-2">Select the primary sport or activity</p>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className={cn(
                    "rounded-xl border-border/50 h-12",
                    errors.category && "border-red-500"
                  )}>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPORTS_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.category}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Location
              </CardTitle>
              <CardDescription>Where is your community based?</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city" className="font-medium">City</Label>
                  <Input
                    id="city"
                    value={formData.location.city}
                    onChange={(e) => handleLocationChange('city', e.target.value)}
                    placeholder="Enter city"
                    className="mt-2 rounded-xl border-border/50 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="font-medium">State / Province</Label>
                  <Input
                    id="state"
                    value={formData.location.state}
                    onChange={(e) => handleLocationChange('state', e.target.value)}
                    placeholder="Enter state"
                    className="mt-2 rounded-xl border-border/50 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="font-medium">Country</Label>
                  <Input
                    id="country"
                    value={formData.location.country}
                    onChange={(e) => handleLocationChange('country', e.target.value)}
                    placeholder="Enter country"
                    className="mt-2 rounded-xl border-border/50 h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Community Rules
              </CardTitle>
              <CardDescription>Set guidelines for your community members</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {formData.rules.map((rule, index) => (
                <div key={index} className="flex gap-2">
                  <div className="w-8 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <Input
                    value={rule}
                    onChange={(e) => handleRuleChange(index, e.target.value)}
                    placeholder={`Rule ${index + 1}: e.g., Be respectful to all members`}
                    className="flex-1 rounded-xl border-border/50 h-11"
                  />
                  {formData.rules.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeRule(index)}
                      className="rounded-xl border-red-200 text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addRule}
                className="w-full rounded-xl border-dashed border-primary/50 text-primary hover:bg-primary/5 mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Rule
              </Button>
              {errors.rules && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.rules}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Privacy & Settings
              </CardTitle>
              <CardDescription>Configure how your community works</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    {formData.isPrivate ? (
                      <Lock className="w-6 h-6 text-primary" />
                    ) : (
                      <Globe className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <Label className="text-base font-semibold">
                      {formData.isPrivate ? 'Private Community' : 'Public Community'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.isPrivate
                        ? 'Users need approval to join'
                        : 'Anyone can join freely'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, isPrivate: checked }))
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Member Permissions
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <Label className="font-medium">Allow Member Posts</Label>
                      <p className="text-xs text-muted-foreground">Members can create posts in the community</p>
                    </div>
                    <Switch
                      checked={formData.settings.allowMemberPosts}
                      onCheckedChange={(checked) =>
                        handleSettingChange('allowMemberPosts', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <Label className="font-medium">Allow Member Events</Label>
                      <p className="text-xs text-muted-foreground">Members can create events in the community</p>
                    </div>
                    <Switch
                      checked={formData.settings.allowMemberEvents}
                      onCheckedChange={(checked) =>
                        handleSettingChange('allowMemberEvents', checked)
                      }
                    />
                  </div>

                  {formData.isPrivate && (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div>
                        <Label className="font-medium">Auto-Approve Members</Label>
                        <p className="text-xs text-muted-foreground">Automatically approve all join requests</p>
                      </div>
                      <Switch
                        checked={formData.settings.autoApproveMembers}
                        onCheckedChange={(checked) =>
                          handleSettingChange('autoApproveMembers', checked)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-border/50 p-4 z-20">
            <div className="container mx-auto max-w-4xl flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/community/${id}`)}
                disabled={loading}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 rounded-xl shadow-lg shadow-primary/20 min-w-32"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCommunity;
