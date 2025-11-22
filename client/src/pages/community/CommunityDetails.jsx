import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  MapPin,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  Crown,
  Shield,
  UserPlus,
  UserMinus,
  Edit3,
  Trash2,
  Share2,
  Heart,
  MessageCircle,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Filter,
  Plus,
  Lock,
  Globe,
  Trophy,
  TrendingUp,
  Clock,
  Camera,
  Video,
  FileText,
  Image as ImageIcon,
  Star,
  Eye,
  Flag,
  ExternalLink
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

// Hooks and Context
import { useAuth } from '@/hooks/useAuth';
import { useCommunity } from '@/hooks/useCommunity';
import { useSocket } from '@/hooks/useSocket';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Utils
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const CommunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const {
    currentCommunity,
    posts,
    loading,
    error,
    fetchCommunity,
    getCommunityPosts,
    joinCommunity,
    leaveCommunity,
    deleteCommunity,
    createCommunityPost,
    likeCommunityPost,
    addCommentToPost
  } = useCommunity();

  // State management
  const [activeTab, setActiveTab] = useState('posts');
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImages, setPostImages] = useState([]);
  const [postType, setPostType] = useState('text');
  const [sortBy, setSortBy] = useState('latest');
  const [showAllRules, setShowAllRules] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs
  const fileInputRef = useRef(null);
  const postInputRef = useRef(null);

  // Fetch community data
  useEffect(() => {
    if (id) {
      fetchCommunity(id);
      getCommunityPosts({ communityId: id, sortBy }, 1);
    }
  }, [id, sortBy]);

  // Socket subscriptions
  useEffect(() => {
    if (socket && id) {
      socket.emit('join-community', id);

      socket.on('new-post', (post) => {
        if (post.community === id) {
          getCommunityPosts({ communityId: id, sortBy }, 1);
        }
      });

      socket.on('post-liked', (data) => {
        // Update post likes in real-time
      });

      socket.on('new-comment', (data) => {
        // Update comments in real-time
      });

      return () => {
        socket.emit('leave-community', id);
        socket.off('new-post');
        socket.off('post-liked');
        socket.off('new-comment');
      };
    }
  }, [socket, id]);

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

  // Handlers
  const handleJoinCommunity = async () => {
    setIsSubmitting(true);
    const success = await joinCommunity(id, joinMessage);
    if (success) {
      setShowJoinDialog(false);
      setJoinMessage('');
      fetchCommunity(id);
    }
    setIsSubmitting(false);
  };

  const handleLeaveCommunity = async () => {
    setIsSubmitting(true);
    const success = await leaveCommunity(id);
    if (success) {
      setShowLeaveDialog(false);
      fetchCommunity(id);
    }
    setIsSubmitting(false);
  };

  const handleDeleteCommunity = async () => {
    setIsSubmitting(true);
    const success = await deleteCommunity(id);
    if (success) {
      setShowDeleteDialog(false);
      navigate('/community');
    }
    setIsSubmitting(false);
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && postImages.length === 0) {
      toast.error('Please add some content or images');
      return;
    }

    setIsSubmitting(true);

    const postData = {
      content: postContent,
      communityId: id,
      images: postImages
    };

    try {
      const result = await createCommunityPost(postData);
      if (result.success) {
        setPostContent('');
        setPostImages([]);
        setPostType('text');
        setShowCreatePost(false);
        // Refresh posts
        await getCommunityPosts({ communityId: id, sortBy }, 1);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await likeCommunityPost(postId);
      // Refresh posts to get updated likes
      await getCommunityPosts({ communityId: id, sortBy }, 1);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId, comment) => {
    try {
      await addCommentToPost(postId, comment);
      // Refresh posts to get updated comments
      await getCommunityPosts({ communityId: id, sortBy }, 1);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + postImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Each image must be less than 5MB');
        return;
      }
    });

    setPostImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setPostImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentCommunity.name,
          text: currentCommunity.description,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // Render loading state
  if (loading && !currentCommunity) {
    return <CommunityDetailsSkeleton />;
  }

  // Render error state
  if (error || !currentCommunity) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Community Not Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The community you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/community')} className="w-full">
              Browse Communities
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const community = currentCommunity;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="relative">
        {/* Cover Image */}
        <div className="h-48 md:h-64 lg:h-80 relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
          {community.image?.url ? (
            <img
              src={community.image.url}
              alt={community.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Users className="w-16 h-16 text-white opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Community Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              {/* Community Avatar */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-4 border-white bg-white overflow-hidden flex-shrink-0">
                {community.image?.url ? (
                  <img
                    src={community.image.url}
                    alt={community.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>

              {/* Community Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold truncate">
                    {community.name}
                  </h1>
                  {community.isPrivate ? (
                    <Lock className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <Globe className="w-5 h-5 flex-shrink-0" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm md:text-base opacity-90">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{community.memberCount || 0} members</span>
                  </div>
                  {community.location?.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{community.location.city}, {community.location.state}</span>
                    </div>
                  )}
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {community.category}
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShare}
                  className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                >
                  <Share2 className="w-4 h-4" />
                  {!isMobile && <span className="ml-2">Share</span>}
                </Button>

                {user && (
                  <>
                    {community.isMember ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {community.canManage && (
                            <>
                              <DropdownMenuItem onClick={() => navigate(`/community/${id}/edit`)}>
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Community
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/community/${id}/manage`)}>
                                <Settings className="w-4 h-4 mr-2" />
                                Manage
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setShowDeleteDialog(true)}
                                className="text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Community
                              </DropdownMenuItem>
                            </>
                          )}
                          {!community.canManage && (
                            <DropdownMenuItem
                              onClick={() => setShowLeaveDialog(true)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <UserMinus className="w-4 h-4 mr-2" />
                              Leave Community
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => community.isPrivate ? setShowJoinDialog(true) : handleJoinCommunity()}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <UserPlus className="w-4 h-4" />
                        {!isMobile && (
                          <span className="ml-2">
                            {community.isPrivate ? 'Request to Join' : 'Join'}
                          </span>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Community Description */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {community.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={itemVariants}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-3 lg:grid-cols-4">
                  <TabsTrigger value="posts" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Posts</span>
                  </TabsTrigger>
                  <TabsTrigger value="events" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Events</span>
                  </TabsTrigger>
                  <TabsTrigger value="members" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Members</span>
                  </TabsTrigger>
                  <TabsTrigger value="about" className="items-center gap-2 hidden lg:flex">
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">About</span>
                  </TabsTrigger>
                </TabsList>

                {/* Posts Tab */}
                <TabsContent value="posts" className="mt-6 space-y-6">
                  {/* Create Post */}
                  {community.isMember && community.canPost && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user?.avatar?.url} />
                            <AvatarFallback>
                              {user?.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left text-gray-500 dark:text-gray-400"
                              onClick={() => setShowCreatePost(true)}
                            >
                              What's on your mind, {user?.name?.split(' ')[0]}?
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowCreatePost(true)}
                              className="flex items-center gap-2"
                            >
                              <ImageIcon className="w-4 h-4" />
                              Photo
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowCreatePost(true)}
                              className="flex items-center gap-2"
                            >
                              <Video className="w-4 h-4" />
                              Video
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowCreatePost(true)}
                              className="flex items-center gap-2"
                            >
                              <Calendar className="w-4 h-4" />
                              Event
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Posts Filter */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Community Posts</h3>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">Latest</SelectItem>
                        <SelectItem value="popular">Popular</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Posts List */}
                  <PostsList
                    posts={posts}
                    currentUser={user}
                    onLike={handleLikePost}
                    onComment={handleAddComment}
                    loading={loading}
                  />
                </TabsContent>

                {/* Events Tab */}
                <TabsContent value="events" className="mt-6">
                  <EventsList communityId={id} />
                </TabsContent>

                {/* Members Tab */}
                <TabsContent value="members" className="mt-6">
                  <MembersList
                    members={community.members || []}
                    admins={community.admins || []}
                    moderators={community.moderators || []}
                    creator={community.creator}
                    currentUser={user}
                    canManage={community.canManage}
                  />
                </TabsContent>

                {/* About Tab */}
                <TabsContent value="about" className="mt-6">
                  <AboutSection community={community} />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Community Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Members</span>
                    <span className="font-semibold">{community.memberCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Posts</span>
                    <span className="font-semibold">{community.stats?.totalPosts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Events</span>
                    <span className="font-semibold">{community.stats?.totalEvents || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                    <span className="font-semibold text-sm">
                      {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Community Rules */}
            {community.rules && community.rules.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Community Rules
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {community.rules.slice(0, showAllRules ? undefined : 3).map((rule, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              {index + 1}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                            {rule}
                          </p>
                        </div>
                      ))}
                      
                      {community.rules.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllRules(!showAllRules)}
                          className="w-full mt-2"
                        >
                          {showAllRules ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Show {community.rules.length - 3} More
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Community Admins */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Community Leaders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Creator */}
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={community.creator?.avatar?.url} />
                      <AvatarFallback>
                        {community.creator?.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{community.creator?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Creator</p>
                    </div>
                    <Crown className="w-4 h-4 text-yellow-500" />
                  </div>

                  {/* Admins */}
                  {community.admins?.filter(admin => admin._id !== community.creator._id).slice(0, 3).map((admin) => (
                    <div key={admin._id} className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={admin.avatar?.url} />
                        <AvatarFallback>
                          {admin.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{admin.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Admin</p>
                      </div>
                      <Shield className="w-4 h-4 text-blue-500" />
                    </div>
                  ))}

                  {/* Moderators */}
                  {community.moderators?.slice(0, 2).map((moderator) => (
                    <div key={moderator._id} className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={moderator.avatar?.url} />
                        <AvatarFallback>
                          {moderator.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{moderator.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Moderator</p>
                      </div>
                      <Star className="w-4 h-4 text-green-500" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Members */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Recent Members
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('members')}
                    >
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {community.members?.slice(0, 5).map((member) => (
                      <div key={member.user._id} className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.user.avatar?.url} />
                          <AvatarFallback>
                            {member.user.name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{member.user.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {/* Join Community Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join {community.name}</DialogTitle>
            <DialogDescription>
              This is a private community. Your request will be reviewed by the admins.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Tell the admins why you'd like to join this community..."
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleJoinCommunity} disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Community Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Community</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave {community.name}? You'll need to request to rejoin if it's a private community.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLeaveCommunity} disabled={isSubmitting}>
              {isSubmitting ? 'Leaving...' : 'Leave Community'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Community Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Community</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the community and all its content.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCommunity} disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete Community'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        content={postContent}
        setContent={setPostContent}
        images={postImages}
        setImages={setPostImages}
        type={postType}
        setType={setPostType}
        onSubmit={handleCreatePost}
        onImageUpload={handleImageUpload}
        onRemoveImage={removeImage}
        isSubmitting={isSubmitting}
        fileInputRef={fileInputRef}
      />
    </motion.div>
  );
};

// Skeleton Loading Component
const CommunityDetailsSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    {/* Hero Skeleton */}
    <div className="h-48 md:h-64 lg:h-80 bg-gray-200 dark:bg-gray-800 relative">
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Posts List Component
const PostsList = ({ posts, currentUser, onLike, onComment, loading }) => {
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [commentTexts, setCommentTexts] = useState({});

  const toggleExpanded = (postId) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const handleComment = async (postId) => {
    const content = commentTexts[postId]?.trim();
    if (!content) return;

    await onComment(postId, content);
    setCommentTexts(prev => ({ ...prev, [postId]: '' }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-20 w-full mb-4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Be the first to share something with this community!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post._id}>
          <CardContent className="p-6">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.author?.avatar?.url} />
                  <AvatarFallback>
                    {post.author?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{post.author?.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {currentUser?._id === post.author?._id && (
                    <>
                      <DropdownMenuItem>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Post
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 dark:text-red-400">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Post
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem>
                    <Flag className="w-4 h-4 mr-2" />
                    Report Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Post Images */}
              {post.images && post.images.length > 0 && (
                <div className="mt-4 grid gap-2" style={{
                  gridTemplateColumns: post.images.length === 1 ? '1fr' : 
                                      post.images.length === 2 ? 'repeat(2, 1fr)' :
                                      'repeat(3, 1fr)'
                }}>
                  {post.images.slice(0, 3).map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {post.images.length > 3 && index === 2 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            +{post.images.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLike(post._id)}
                  className={cn(
                    "flex items-center gap-2",
                    post.isLiked && "text-red-500"
                  )}
                >
                  <Heart className={cn("w-4 h-4", post.isLiked && "fill-current")} />
                  <span>{post.likesCount || 0}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(post._id)}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.commentsCount || 0}</span>
                </Button>

                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Eye className="w-4 h-4" />
                <span>{post.viewsCount || 0} views</span>
              </div>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
              {expandedPosts.has(post._id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t space-y-4"
                >
                  {/* Add Comment */}
                  {currentUser && (
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={currentUser.avatar?.url} />
                        <AvatarFallback>
                          {currentUser.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder="Write a comment..."
                          value={commentTexts[post._id] || ''}
                          onChange={(e) => setCommentTexts(prev => ({
                            ...prev,
                            [post._id]: e.target.value
                          }))}
                          rows={2}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleComment(post._id)}
                          disabled={!commentTexts[post._id]?.trim()}
                        >
                          Comment
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className="space-y-3">
                    {post.comments?.map((comment) => (
                      <div key={comment._id} className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.author?.avatar?.url} />
                          <AvatarFallback>
                            {comment.author?.name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                            <p className="font-medium text-sm">{comment.author?.name}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {comment.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <button className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600">
                              Like
                            </button>
                            <button className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600">
                              Reply
                            </button>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Events List Component
const EventsList = ({ communityId }) => {
  // Implementation for community events
  return (
    <Card>
      <CardContent className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No events yet</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Community events will appear here once they're created.
        </p>
      </CardContent>
    </Card>
  );
};

// Members List Component
const MembersList = ({ members, admins, moderators, creator, currentUser, canManage }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredMembers = members?.filter(member => {
    const matchesSearch = member.user.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || member.role === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="moderator">Moderators</SelectItem>
            <SelectItem value="member">Members</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers?.map((member) => (
          <Card key={member.user._id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={member.user.avatar?.url} />
                  <AvatarFallback>
                    {member.user.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{member.user.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {member.role}
                    </Badge>
                    {member.role === 'admin' && <Crown className="w-3 h-3 text-yellow-500" />}
                    {member.role === 'moderator' && <Star className="w-3 h-3 text-green-500" />}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                  </p>
                </div>
                {canManage && member.user._id !== currentUser?._id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Crown className="w-4 h-4 mr-2" />
                        Promote to Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Star className="w-4 h-4 mr-2" />
                        Make Moderator
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 dark:text-red-400">
                        <UserMinus className="w-4 h-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers?.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No members found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// About Section Component
const AboutSection = ({ community }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>About {community.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-gray-700 dark:text-gray-300">{community.description}</p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Category</h4>
            <Badge>{community.category}</Badge>
          </div>

          {community.location?.city && (
            <div>
              <h4 className="font-medium mb-2">Location</h4>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{community.location.city}, {community.location.state}, {community.location.country}</span>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2">Privacy</h4>
            <div className="flex items-center gap-2">
              {community.isPrivate ? (
                <>
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span>Private Community</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span>Public Community</span>
                </>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Created</h4>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>{formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}</span>
            </div>
          </div>

          {community.settings && (
            <div>
              <h4 className="font-medium mb-2">Community Settings</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Member Posts</span>
                  <Badge variant={community.settings.allowMemberPosts ? "default" : "secondary"}>
                    {community.settings.allowMemberPosts ? "Allowed" : "Restricted"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Post Approval</span>
                  <Badge variant={community.settings.requireApproval ? "default" : "secondary"}>
                    {community.settings.requireApproval ? "Required" : "Not Required"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Events</span>
                  <Badge variant={community.settings.allowEvents ? "default" : "secondary"}>
                    {community.settings.allowEvents ? "Allowed" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Discussions</span>
                  <Badge variant={community.settings.allowDiscussions ? "default" : "secondary"}>
                    {community.settings.allowDiscussions ? "Allowed" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Create Post Dialog Component
const CreatePostDialog = ({
  open,
  onOpenChange,
  content,
  setContent,
  images,
  setImages,
  type,
  setType,
  onSubmit,
  onImageUpload,
  onRemoveImage,
  isSubmitting,
  fileInputRef
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription>
            Share something with your community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Post Type Selector */}
          <div className="flex items-center gap-2">
            <Button
              variant={type === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType('text')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Text
            </Button>
            <Button
              variant={type === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType('image')}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Photo
            </Button>
            <Button
              variant={type === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType('video')}
            >
              <Video className="w-4 h-4 mr-2" />
              Video
            </Button>
          </div>

          {/* Content Input */}
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="resize-none"
          />

          {/* Image Upload */}
          {(type === 'image' || images.length > 0) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Images</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= 5}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Images
                </Button>
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 w-6 h-6 p-0"
                        onClick={() => onRemoveImage(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={onImageUpload}
                className="hidden"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting || (!content.trim() && images.length === 0)}>
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityDetails;