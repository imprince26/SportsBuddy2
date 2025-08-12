import React,{ useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Users,
  MapPin,
  Camera,
  Image as ImageIcon,
  Tag,
  Globe,
  Lock,
  Settings,
  ChevronLeft,
  Upload,
  X,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Trophy,
  Target,
  Calendar,
  MessageSquare,
  Shield,
  Zap,
  Info,
  Plus,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useCommunity } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';
import api from '@/utils/api';

const CreateCommunity = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: {
      city: '',
      state: '',
      country: 'India'
    },
    rules: [],
    isPrivate: false,
    settings: {
      allowMemberPosts: true,
      requireApproval: false,
      allowEvents: true,
      allowDiscussions: true
    },
    image: null
  });

  const [newRule, setNewRule] = useState('');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  // Categories
  const categories = [
    { value: 'football', label: 'Football', icon: '⚽' },
    { value: 'cricket', label: 'Cricket', icon: '🏏' },
    { value: 'basketball', label: 'Basketball', icon: '🏀' },
    { value: 'badminton', label: 'Badminton', icon: '🏸' },
    { value: 'tennis', label: 'Tennis', icon: '🎾' },
    { value: 'volleyball', label: 'Volleyball', icon: '🏐' },
    { value: 'swimming', label: 'Swimming', icon: '🏊‍♂️' },
    { value: 'running', label: 'Running', icon: '🏃‍♂️' },
    { value: 'cycling', label: 'Cycling', icon: '🚴‍♂️' },
    { value: 'gym', label: 'Gym & Fitness', icon: '💪' },
    { value: 'yoga', label: 'Yoga', icon: '🧘‍♀️' },
    { value: 'other', label: 'Other Sports', icon: '🏆' }
  ];

  // Steps configuration
  const steps = [
    {
      number: 1,
      title: 'Basic Info',
      description: 'Community name and description',
      icon: Info
    },
    {
      number: 2,
      title: 'Category & Location',
      description: 'Choose category and location',
      icon: MapPin
    },
    {
      number: 3,
      title: 'Settings & Rules',
      description: 'Configure community settings',
      icon: Settings
    },
    {
      number: 4,
      title: 'Review & Create',
      description: 'Review and create community',
      icon: CheckCircle
    }
  ];

  // Handle form updates
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Add rule
  const addRule = () => {
    if (newRule.trim()) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()]
      }));
      setNewRule('');
    }
  };

  // Remove rule
  const removeRule = (index) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  // Navigation
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Validation
  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.name.trim() && formData.description.trim();
      case 2:
        return formData.category && formData.location.city.trim();
      case 3:
        return true; // Settings are optional
      case 4:
        return true; // Review step
      default:
        return false;
    }
  };

  // Submit form
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading('Creating community...');

    try {
      const submitData = new FormData();
      
      // Append form data
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('location', JSON.stringify(formData.location));
      submitData.append('rules', JSON.stringify(formData.rules));
      submitData.append('isPrivate', formData.isPrivate);
      submitData.append('settings', JSON.stringify(formData.settings));
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const response = await api.post('/community', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Community created successfully!', { id: toastId });
        navigate(`/community/${response.data.data._id}`);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create community';
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress calculation
  const getProgress = () => {
    return (currentStep / 4) * 100;
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            {/* Community Image */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Community"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Upload a community image (optional)
              </p>
            </div>

            {/* Community Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-900 dark:text-white">
                Community Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter community name..."
                className="bg-white/70 dark:bg-gray-800/70 border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-900 dark:text-white">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your community, its purpose, and what members can expect..."
                rows={4}
                className="bg-white/70 dark:bg-gray-800/70 border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            {/* Category Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Sports Category *
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <motion.button
                    key={category.value}
                    type="button"
                    onClick={() => handleInputChange('category', category.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.category === category.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white/50 dark:bg-gray-800/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className="text-sm font-medium">{category.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Location *
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    value={formData.location.city}
                    onChange={(e) => handleInputChange('location.city', e.target.value)}
                    placeholder="City"
                    className="bg-white/70 dark:bg-gray-800/70 border-gray-200/50 dark:border-gray-700/50"
                  />
                </div>
                <div>
                  <Input
                    value={formData.location.state}
                    onChange={(e) => handleInputChange('location.state', e.target.value)}
                    placeholder="State"
                    className="bg-white/70 dark:bg-gray-800/70 border-gray-200/50 dark:border-gray-700/50"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            {/* Privacy Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex items-center space-x-3">
                  {formData.isPrivate ? (
                    <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  ) : (
                    <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {formData.isPrivate ? 'Private Community' : 'Public Community'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.isPrivate 
                        ? 'Members need approval to join' 
                        : 'Anyone can join freely'
                      }
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) => handleInputChange('isPrivate', checked)}
                />
              </div>
            </div>

            {/* Community Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Community Settings
              </h4>
              
              <div className="space-y-3">
                {[
                  {
                    key: 'allowMemberPosts',
                    label: 'Allow Member Posts',
                    description: 'Members can create posts and discussions',
                    icon: MessageSquare
                  },
                  {
                    key: 'requireApproval',
                    label: 'Require Post Approval',
                    description: 'Posts need approval before being visible',
                    icon: Shield
                  },
                  {
                    key: 'allowEvents',
                    label: 'Allow Events',
                    description: 'Members can create and join events',
                    icon: Calendar
                  },
                  {
                    key: 'allowDiscussions',
                    label: 'Allow Discussions',
                    description: 'Enable discussion threads and comments',
                    icon: MessageSquare
                  }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <setting.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">{setting.label}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.settings[setting.key]}
                      onCheckedChange={(checked) => 
                        handleInputChange(`settings.${setting.key}`, checked)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Community Rules */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Community Rules (Optional)
              </h4>
              
              <div className="flex gap-2">
                <Input
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  placeholder="Add a community rule..."
                  className="flex-1 bg-white/70 dark:bg-gray-800/70 border-gray-200/50 dark:border-gray-700/50"
                  onKeyPress={(e) => e.key === 'Enter' && addRule()}
                />
                <Button
                  type="button"
                  onClick={addRule}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.rules.length > 0 && (
                <div className="space-y-2">
                  {formData.rules.map((rule, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg"
                    >
                      <span className="text-sm text-gray-900 dark:text-white">{rule}</span>
                      <Button
                        type="button"
                        onClick={() => removeRule(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            {/* Review Section */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Review Your Community</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please review all details before creating your community
                </p>
              </div>
            </div>

            {/* Community Preview */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Community"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                        {formData.name}
                      </h4>
                      {formData.isPrivate ? (
                        <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                          <Lock className="w-3 h-3 mr-1" />
                          Private
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                          <Globe className="w-3 h-3 mr-1" />
                          Public
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {formData.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {categories.find(c => c.value === formData.category)?.label}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {formData.location.city}, {formData.location.state}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Settings Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">Community Features</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(formData.settings).map(([key, enabled]) => (
                      <div key={key} className="flex items-center space-x-2">
                        {enabled ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`text-sm ${enabled ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rules */}
                {formData.rules.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">Community Rules</h5>
                    <ul className="space-y-2">
                      {formData.rules.map((rule, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/10 dark:bg-blue-400/5 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.5, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="absolute left-4 top-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Users className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Create Community
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Build your sports community and connect with like-minded people
              </p>
            </div>
          </motion.div>

          {/* Progress Section */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Step {currentStep} of 4
                  </h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(getProgress())}% Complete
                  </span>
                </div>
                <Progress value={getProgress()} className="h-2 mb-6" />
                
                {/* Steps */}
                <div className="grid grid-cols-4 gap-2">
                  {steps.map((step) => (
                    <div
                      key={step.number}
                      className={`text-center p-3 rounded-lg transition-all ${
                        currentStep >= step.number
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400'
                      }`}
                    >
                      <step.icon className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs font-medium">{step.title}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Form Content */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5 text-white" })}
                  </div>
                  {steps[currentStep - 1].title}
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  {steps[currentStep - 1].description}
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  {renderStepContent()}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Navigation */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < 4 ? (
                    <Button
                      onClick={nextStep}
                      disabled={!validateStep(currentStep)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                      Next
                      <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !validateStep(currentStep)}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Create Community
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateCommunity;
