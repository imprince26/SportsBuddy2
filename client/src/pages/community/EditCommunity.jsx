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
  Info,
  Loader2
} from 'lucide-react';
import { useCommunity } from '@/hooks/useCommunity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
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

    // Only include image if a new file was selected
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative pb-20">
      {/* Header */}
      <div className="border-b border-border bg-white dark:bg-gray-900 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Community</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update your community settings
              </p>
            </div>
          </div>
        </div>
      </div>

        {/* Form */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-gray-900 dark:text-white">Basic Information</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Essential details about your community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {/* Community Image */}
                <div>
                  <Label>Community Image</Label>
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer bg-card hover:bg-accent/50 transition">
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload image
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          PNG, JPG up to 5MB
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                    {errors.image && (
                      <p className="text-sm text-red-500 mt-1">{errors.image}</p>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor="name">
                    Community Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter community name"
                    maxLength={100}
                    className="mt-1"
                  />
                  <div className="flex justify-between mt-1">
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground ml-auto">
                      {formData.name.length}/100
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your community..."
                    maxLength={500}
                    rows={4}
                    className="mt-1"
                  />
                  <div className="flex justify-between mt-1">
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground ml-auto">
                      {formData.description.length}/500
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a sport category" />
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
                    <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-gray-900 dark:text-white">Location</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Where is your community based?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.location.city}
                      onChange={(e) => handleLocationChange('city', e.target.value)}
                      placeholder="Enter city"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.location.state}
                      onChange={(e) => handleLocationChange('state', e.target.value)}
                      placeholder="Enter state"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.location.country}
                      onChange={(e) => handleLocationChange('country', e.target.value)}
                      placeholder="Enter country"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Rules */}
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-gray-900 dark:text-white">Community Rules</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Set guidelines for your community members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {formData.rules.map((rule, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={rule}
                      onChange={(e) => handleRuleChange(index, e.target.value)}
                      placeholder={`Rule ${index + 1}`}
                      className="flex-1"
                    />
                    {formData.rules.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeRule(index)}
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
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
                {errors.rules && (
                  <p className="text-sm text-red-500">{errors.rules}</p>
                )}
              </CardContent>
            </Card>

            {/* Privacy & Settings */}
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-gray-900 dark:text-white">Privacy & Settings</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Configure how your community works
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Privacy */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {formData.isPrivate ? (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Globe className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <Label>Private Community</Label>
                      <p className="text-xs text-muted-foreground">
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
                  />
                </div>

                <div className="h-px bg-border" />

                {/* Member Permissions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Info className="w-4 h-4" />
                    Member Permissions
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Member Posts</Label>
                      <p className="text-xs text-muted-foreground">
                        Members can create posts in the community
                      </p>
                    </div>
                    <Switch
                      checked={formData.settings.allowMemberPosts}
                      onCheckedChange={(checked) =>
                        handleSettingChange('allowMemberPosts', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Member Events</Label>
                      <p className="text-xs text-muted-foreground">
                        Members can create events in the community
                      </p>
                    </div>
                    <Switch
                      checked={formData.settings.allowMemberEvents}
                      onCheckedChange={(checked) =>
                        handleSettingChange('allowMemberEvents', checked)
                      }
                    />
                  </div>

                  {!formData.isPrivate && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-Approve Members</Label>
                        <p className="text-xs text-muted-foreground">
                          Automatically approve all join requests
                        </p>
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
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/community/${id}`)}
                disabled={loading}
                className="border-gray-300 dark:border-gray-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </div>
    </div>
  );
};

export default EditCommunity;
