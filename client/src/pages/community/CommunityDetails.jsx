import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  MessageSquare,
  Plus,
  Filter,
  Flag,
  ChevronDown,
  Edit3,
  Settings,
  Users,
  Shield
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Community Components
import PostCard from '@/components/community/PostCard'
import ImageGalleryModal from '@/components/community/ImageGalleryModal'
import {
  CommunityHeroSection,
  CommunityDetailsSkeleton,
  CommunityMembersList,
  MembersPreviewCard,
  CreatePostPrompt,
  CreatePostDialog,
  EditPostDialog,
  CommunityAboutSection,
  CommunityAboutCard,
  JoinCommunityDialog,
  LeaveCommunityDialog,
  DeleteCommunityDialog,
  DeletePostDialog
} from '@/components/community/details'

// Hooks and Context
import { useAuth } from '@/hooks/useAuth'
import { useCommunity } from '@/hooks/useCommunity'
import { useSocket } from '@/hooks/useSocket'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useMetadata } from '@/hooks/useMetadata'

// Utils
import { cn } from '@/lib/utils'

const CommunityDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket } = useSocket()
  const isMobile = useMediaQuery('(max-width: 768px)')

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
    updateCommunityPost,
    likeCommunityPost,
    addCommentToPost,
    sharePost,
    deleteCommunityPost
  } = useCommunity()

  // State management
  const [activeTab, setActiveTab] = useState('posts')
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDeletePostDialog, setShowDeletePostDialog] = useState(false)
  const [postToDelete, setPostToDelete] = useState(null)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showEditPost, setShowEditPost] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [joinMessage, setJoinMessage] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postImages, setPostImages] = useState([])
  const [sortBy, setSortBy] = useState('latest')
  const [showAllMembers, setShowAllMembers] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryImages, setGalleryImages] = useState([])
  const [galleryIndex, setGalleryIndex] = useState(0)

  // Use metadata hook
  useMetadata(currentCommunity ? { community: currentCommunity } : {})

  // Refs
  const fileInputRef = useRef(null)

  // Fetch community data
  useEffect(() => {
    if (id) {
      fetchCommunity(id)
    }
  }, [id])

  // Refresh posts when sortBy changes
  useEffect(() => {
    if (id) {
      getCommunityPosts({ communityId: id, sortBy }, 1)
    }
  }, [id, sortBy])

  // Socket subscriptions
  useEffect(() => {
    if (socket && id) {
      socket.emit('join-community', id)

      socket.on('new-post', (post) => {
        if (post.community === id) {
          getCommunityPosts({ communityId: id, sortBy }, 1)
        }
      })

      return () => {
        socket.emit('leave-community', id)
        socket.off('new-post')
      }
    }
  }, [socket, id])

  // Handlers
  const handleJoinCommunity = async () => {
    setIsSubmitting(true)
    const result = await joinCommunity(id, joinMessage)
    if (result?.success) {
      setShowJoinDialog(false)
      setJoinMessage('')
      fetchCommunity(id)
      toast.success('Successfully joined the community!')
    } else {
      toast.error(result?.message || 'Failed to join community')
    }
    setIsSubmitting(false)
  }

  const handleLeaveCommunity = async () => {
    setIsSubmitting(true)
    const success = await leaveCommunity(id)
    if (success) {
      setShowLeaveDialog(false)
      fetchCommunity(id)
      toast.success('You have left the community')
    }
    setIsSubmitting(false)
  }

  const handleDeleteCommunity = async () => {
    setIsSubmitting(true)
    const success = await deleteCommunity(id)
    if (success) {
      setShowDeleteDialog(false)
      navigate('/community')
      toast.success('Community deleted successfully')
    }
    setIsSubmitting(false)
  }

  const handleCreatePost = async () => {
    if (!postContent.trim() && postImages.length === 0) {
      toast.error('Please add some content or images')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createCommunityPost({
        content: postContent,
        communityId: id,
        images: postImages
      })
      if (result.success) {
        setPostContent('')
        setPostImages([])
        setShowCreatePost(false)
        await getCommunityPosts({ communityId: id, sortBy }, 1)
        toast.success('Post created successfully!')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePost = async () => {
    if (!postContent.trim() && postImages.length === 0) {
      toast.error('Post content required')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateCommunityPost(editingPost._id, {
        content: postContent,
        ...(postImages.length > 0 && { images: postImages })
      })

      if (result.success) {
        setShowEditPost(false)
        setEditingPost(null)
        setPostContent('')
        setPostImages([])
        await getCommunityPosts({ communityId: id, sortBy }, 1)
        toast.success('Post updated!')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error('Failed to update post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLikePost = async (postId) => {
    try {
      await likeCommunityPost(postId)
      await getCommunityPosts({ communityId: id, sortBy }, 1)
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleSharePost = async (postId) => {
    try {
      await sharePost(postId)
      const url = `${window.location.origin}/community/post/${postId}`
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to share post')
    }
  }

  const handleEditPost = (post) => {
    setEditingPost(post)
    setPostContent(post.content)
    setPostImages([])
    setShowEditPost(true)
  }

  const handleDeletePost = (postId) => {
    setPostToDelete(postId)
    setShowDeletePostDialog(true)
  }

  const confirmDeletePost = async () => {
    if (!postToDelete) return
    try {
      await deleteCommunityPost(postToDelete)
      toast.success('Post deleted successfully')
      await getCommunityPosts({ communityId: id, sortBy }, 1)
      setShowDeletePostDialog(false)
      setPostToDelete(null)
    } catch (error) {
      toast.error('Failed to delete post')
    }
  }

  const handleImageClick = (images, index) => {
    setGalleryImages(images)
    setGalleryIndex(index)
    setGalleryOpen(true)
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + postImages.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Each image must be less than 5MB')
        return
      }
    })
    setPostImages(prev => [...prev, ...files])
  }

  const removeImage = (index) => {
    setPostImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentCommunity.name,
          text: currentCommunity.description,
          url: window.location.href
        })
      } catch (error) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  // Loading state
  if (loading || !currentCommunity) {
    return <CommunityDetailsSkeleton />
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Community Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The community you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/community')} className="w-full">
              Browse Communities
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const community = currentCommunity
  const myPosts = posts?.filter(post =>
    post.author?._id === user?.id || post.author?.id === user?.id
  ) || []

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <CommunityHeroSection
        community={community}
        user={user}
        isMobile={isMobile}
        onShare={handleShare}
        onJoin={handleJoinCommunity}
        onShowJoinDialog={() => setShowJoinDialog(true)}
        onShowLeaveDialog={() => setShowLeaveDialog(true)}
        onShowDeleteDialog={() => setShowDeleteDialog(true)}
        onNavigateEdit={() => navigate(`/community/${id}/edit`)}
        onNavigateManage={() => navigate(`/community/${id}/manage`)}
      />

      {/* Management Action Bar - Only for eligible users */}
      {/* {community.canManage && (
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-primary/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary">You can manage this community</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/community/${id}/edit`)}
                  className="gap-2 bg-background hover:bg-primary hover:text-primary-foreground border-primary/30"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit Community</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate(`/community/${id}/manage`)}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Manage Members</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-4 bg-card border border-border p-1">
                <TabsTrigger value="posts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Posts
                </TabsTrigger>
                {community.isMember && (
                  <TabsTrigger value="my-posts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    My Posts
                  </TabsTrigger>
                )}
                <TabsTrigger value="members" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Members
                </TabsTrigger>
                <TabsTrigger value="about" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  About
                </TabsTrigger>
              </TabsList>

              {/* Posts Tab */}
              <TabsContent value="posts" className="mt-6 space-y-6">
                {/* Create Post */}
                {community.isMember && community.canPost && (
                  <CreatePostPrompt user={user} onClick={() => setShowCreatePost(true)} />
                )}

                {/* Sort Filter */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Community Posts</h3>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="popular">Most Liked</SelectItem>
                      <SelectItem value="comments">Most Discussed</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Posts List */}
                <div className="space-y-4">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <Card key={i} className="border-border">
                        <CardContent className="p-4 space-y-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-20 w-full" />
                        </CardContent>
                      </Card>
                    ))
                  ) : !posts || posts.length === 0 ? (
                    <Card className="border-border bg-card/50 border-dashed">
                      <CardContent className="text-center py-16">
                        <MessageSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                        <p className="text-muted-foreground mb-6">
                          Be the first to share something with this community!
                        </p>
                        {community.isMember && community.canPost && (
                          <Button onClick={() => setShowCreatePost(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Post
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {posts.map((post, index) => (
                        <motion.div
                          key={post._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <PostCard
                            post={post}
                            currentUser={user}
                            onLike={handleLikePost}
                            onShare={handleSharePost}
                            onEdit={handleEditPost}
                            onDelete={handleDeletePost}
                            onImageClick={handleImageClick}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </TabsContent>

              {/* My Posts Tab */}
              {community.isMember && (
                <TabsContent value="my-posts" className="mt-6 space-y-4">
                  {myPosts.length === 0 ? (
                    <Card className="border-border bg-card/50 border-dashed">
                      <CardContent className="text-center py-16">
                        <MessageSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                        <p className="text-muted-foreground mb-6">
                          You haven't created any posts in this community yet.
                        </p>
                        <Button onClick={() => setShowCreatePost(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Post
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {myPosts.map((post, index) => (
                        <motion.div
                          key={post._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <PostCard
                            post={post}
                            currentUser={user}
                            onLike={handleLikePost}
                            onShare={handleSharePost}
                            onEdit={handleEditPost}
                            onDelete={handleDeletePost}
                            onImageClick={handleImageClick}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </TabsContent>
              )}

              {/* Members Tab */}
              <TabsContent value="members" className="mt-6">
                <CommunityMembersList
                  members={community.members || []}
                  admins={community.admins || []}
                  moderators={community.moderators || []}
                  creator={community.creator}
                  currentUser={user}
                  canManage={community.canManage}
                  showAll={showAllMembers}
                  onShowAll={() => setShowAllMembers(true)}
                />
              </TabsContent>

              {/* About Tab */}
              <TabsContent value="about" className="mt-6">
                <CommunityAboutSection community={community} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            {/* Management Tools Card - Only for eligible users */}
            {community.canManage && (
              <Card className="border-border overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 p-4">
                  <div className="flex items-center gap-2 text-white">
                    <span className="font-semibold">Management Tools</span>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/community/${id}/edit`)}
                    className="w-full justify-start gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Community
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/community/${id}/manage`)}
                    className="w-full justify-start gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Manage Members
                  </Button>
                  {community.isPrivate && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Private community - approval required</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* About Card */}
            <CommunityAboutCard community={community} />

            {/* Members Preview */}
            <MembersPreviewCard
              members={community.members || []}
              totalCount={community.memberCount || 0}
              creator={community.creator}
              onViewAll={() => setActiveTab('members')}
            />
          </div>
        </div>
      </div>

      {/* Floating Create Post Button (Mobile) */}
      {community.isMember && community.canPost && (
        <motion.div
          className="fixed bottom-6 right-6 z-50 lg:hidden"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        >
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90"
            onClick={() => setShowCreatePost(true)}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      )}

      {/* Dialogs */}
      <JoinCommunityDialog
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
        communityName={community.name}
        message={joinMessage}
        setMessage={setJoinMessage}
        onSubmit={handleJoinCommunity}
        isSubmitting={isSubmitting}
      />

      <LeaveCommunityDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        communityName={community.name}
        onSubmit={handleLeaveCommunity}
        isSubmitting={isSubmitting}
      />

      <DeleteCommunityDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        communityName={community.name}
        onSubmit={handleDeleteCommunity}
        isSubmitting={isSubmitting}
      />

      <DeletePostDialog
        open={showDeletePostDialog}
        onOpenChange={setShowDeletePostDialog}
        onSubmit={confirmDeletePost}
        isSubmitting={isSubmitting}
      />

      <CreatePostDialog
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        user={user}
        content={postContent}
        setContent={setPostContent}
        images={postImages}
        onImageUpload={handleImageUpload}
        onRemoveImage={removeImage}
        onSubmit={handleCreatePost}
        isSubmitting={isSubmitting}
      />

      <EditPostDialog
        open={showEditPost}
        onOpenChange={setShowEditPost}
        post={editingPost}
        content={postContent}
        setContent={setPostContent}
        images={postImages}
        onImageUpload={handleImageUpload}
        onRemoveImage={removeImage}
        onSubmit={handleUpdatePost}
        isSubmitting={isSubmitting}
      />

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        images={galleryImages}
        initialIndex={galleryIndex}
      />
    </div>
  )
}

export default CommunityDetails