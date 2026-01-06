import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  Lock,
  Globe,
  Info
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
import HeroBg from '@/components/HeroBg';

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

const CreateCommunity = () => {
  const navigate = useNavigate();
  const { createCommunity, loading } = useCommunity();

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
      rules: formData.rules.filter(r => r.trim()),
      image: imageFile
    };

    const result = await createCommunity(submitData);

    if (result.success) {
      navigate(`/community/${result.data._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background relative pb-20">

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-20">
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
                <h1 className="text-2xl font-bold">Create Community</h1>
                <p className="text-sm text-muted-foreground">
                  Build a community around your favorite sport
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential details about your community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>
                  Where is your community based? (Optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
            <Card>
              <CardHeader>
                <CardTitle>Community Rules</CardTitle>
                <CardDescription>
                  Set guidelines for your community members <span className="text-red-500">*</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Settings</CardTitle>
                <CardDescription>
                  Configure how your community works
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Community'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunity;
