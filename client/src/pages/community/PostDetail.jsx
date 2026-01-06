import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Send,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Users,
  Clock,
  Bookmark
} from 'lucide-react';
import { useCommunity } from '../../hooks/useCommunity';
import { useAuth } from '../../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Skeleton } from '../../components/ui/skeleton';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import ImageGalleryModal from '../../components/community/ImageGalleryModal';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Loading skeleton for post detail
const PostDetailSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-3xl mx-auto pb-8">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>

      {/* Post Card Skeleton */}
      <Card className="mt-4 mx-4 border-border">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Comment Item Component
const CommentItem = ({
  comment,
  currentUser,
  onLike,
  onReply,
  onLikeReply,
  onEdit,
  onDelete,
  level = 0,
  postId,
  onRefresh,
  parentCommentId
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [isLiked, setIsLiked] = useState(
    comment.likes?.some(like => like.user === currentUser?.id || like.user?._id === currentUser?.id)
  );
  const [localLikesCount, setLocalLikesCount] = useState(comment.likes?.length || 0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    setIsLiked(comment.likes?.some(like => like.user === currentUser?.id || like.user?._id === currentUser?.id));
    setLocalLikesCount(comment.likes?.length || 0);
  }, [comment.likes, currentUser]);

  const handleLike = async () => {
    if (!currentUser) {
      toast.error('Please login to like comments');
      return;
    }

    const wasLiked = isLiked;
    const previousCount = localLikesCount;

    setIsLiked(!wasLiked);
    setLocalLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

    (async () => {
      try {
        if (level > 0 && parentCommentId && onLikeReply) {
          await onLikeReply(postId, parentCommentId, comment._id);
        } else {
          await onLike(postId, comment._id);
        }
      } catch (error) {
        setIsLiked(wasLiked);
        setLocalLikesCount(previousCount);
        toast.error('Failed to update like');
      }
    })();
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    try {
      const result = await onReply(postId, comment._id, replyContent);
      if (result) {
        setReplyContent('');
        setShowReplyForm(false);
        setTimeout(async () => {
          if (onRefresh) await onRefresh();
        }, 300);
      }
    } catch (error) {
      toast.error('Failed to add reply');
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      await onEdit(postId, level > 0 ? parentCommentId : null, comment._id, editContent);
      setIsEditing(false);
      setTimeout(async () => {
        if (onRefresh) await onRefresh();
      }, 300);
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(postId, level > 0 ? parentCommentId : null, comment._id);
      setShowDeleteDialog(false);
      setTimeout(async () => {
        if (onRefresh) await onRefresh();
      }, 300);
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const author = comment.author || {};
  const authorName = author.name || author.username || 'Unknown User';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("group", level > 0 && "ml-12 mt-3")}
    >
      <div className="flex gap-3">
        <Link to={`/profile/${author._id || author.id}`}>
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={author.avatar?.url} alt={authorName} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {authorName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1">
          <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/profile/${author._id || author.id}`}
                  className="font-semibold text-sm text-foreground hover:text-primary transition-colors"
                >
                  {authorName}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt && ' (edited)'}
                </span>
              </div>

              {currentUser && (author._id === currentUser.id || author.id === currentUser.id) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-3 w-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px] text-sm border-border"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEdit}>Save</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}
          </div>

          {/* Comment Actions */}
          <div className="flex items-center gap-4 mt-2 px-1">
            <button
              onClick={handleLike}
              className={cn(
                "flex items-center gap-1 text-xs transition-colors",
                isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current")} />
              <span>{localLikesCount}</span>
            </button>
            {level < 2 && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Reply
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3 flex gap-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px] text-sm border-border"
              />
              <div className="flex flex-col gap-2">
                <Button size="sm" onClick={handleReply}>
                  <Send className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowReplyForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  currentUser={currentUser}
                  onLike={onLike}
                  onReply={onReply}
                  onLikeReply={onLikeReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  postId={postId}
                  level={level + 1}
                  onRefresh={onRefresh}
                  parentCommentId={level === 0 ? comment._id : parentCommentId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentPost,
    loading,
    getCommunityPostById,
    likeCommunityPost,
    addCommentToPost,
    likeComment,
    replyToComment,
    likeReply,
    sharePost,
    incrementPostView,
    updateCommentContent,
    deleteCommentContent,
    updateReplyContent,
    deleteReplyContent,
  } = useCommunity();

  const [commentContent, setCommentContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [commentFilter, setCommentFilter] = useState('newest');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      getCommunityPostById(postId);
      if (user) {
        incrementPostView(postId);
      }
    }
  }, [postId]);

  useEffect(() => {
    if (currentPost) {
      setIsLiked(
        currentPost.likes?.some(like => like.user === user?.id || like.user?._id === user?.id)
      );
      setLikesCount(currentPost.likes?.length || 0);
      setSharesCount(currentPost.shares || 0);
    }
  }, [currentPost, user]);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    await likeCommunityPost(postId);
  };

  const handleComment = async () => {
    if (!commentContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await addCommentToPost(postId, commentContent);
      if (result && result.success) {
        setCommentContent('');
        await getCommunityPostById(postId);
        toast.success('Comment added successfully!');
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      const shareData = {
        title: `${currentPost.author?.name || 'User'}'s Post`,
        text: currentPost.content || 'Check out this post!',
        url: url,
      };

      if (navigator.share) {
        await navigator.share(shareData);
        const result = await sharePost(postId);
        if (result && result.success) {
          setSharesCount(result.data.shares);
        }
        toast.success('Post shared successfully!');
      } else {
        await navigator.clipboard.writeText(url);
        const result = await sharePost(postId);
        if (result && result.success) {
          setSharesCount(result.data.shares);
        }
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('Failed to share post');
      }
    }
  };

  const handleEditComment = async (postId, parentCommentId, commentId, content) => {
    if (parentCommentId) {
      await updateReplyContent(postId, parentCommentId, commentId, content);
    } else {
      await updateCommentContent(postId, commentId, content);
    }
  };

  const handleDeleteComment = async (postId, parentCommentId, commentId) => {
    if (parentCommentId) {
      await deleteReplyContent(postId, parentCommentId, commentId);
    } else {
      await deleteCommentContent(postId, commentId);
    }
  };

  const handleImageClick = (index) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  if (loading) {
    return <PostDetailSkeleton />;
  }

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4 border-border">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Post not found</h2>
            <p className="text-muted-foreground mb-6">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const author = currentPost.author || {};
  const authorName = author.name || author.username || 'Unknown User';

  // Filter and sort comments
  const getFilteredComments = () => {
    if (!currentPost?.comments) return [];
    const comments = [...currentPost.comments];

    switch (commentFilter) {
      case 'oldest':
        return comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'most-liked':
        return comments.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
      case 'newest':
      default:
        return comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  const filteredComments = getFilteredComments();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
        >
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Post</h1>
              {currentPost.community && (
                <Link
                  to={`/community/${currentPost.community._id}`}
                  className="text-sm text-primary hover:underline"
                >
                  {currentPost.community.name}
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Post Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mt-4 mx-4 border-border bg-card">
            <CardContent className="p-6">
              {/* Author Info */}
              <div className="flex items-start gap-4 mb-4">
                <Link to={`/profile/${author._id || author.id}`}>
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={author.avatar?.url} alt={authorName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {authorName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div className="flex-1">
                  <Link
                    to={`/profile/${author._id || author.id}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {authorName}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>@{author.username || 'user'}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(currentPost.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save Post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Content */}
              <p className="text-lg text-foreground mb-4 whitespace-pre-wrap break-words leading-relaxed">
                {currentPost.content}
              </p>

              {/* Images */}
              {currentPost.images && currentPost.images.length > 0 && (
                <div className={cn(
                  "mb-4 rounded-xl overflow-hidden",
                  currentPost.images.length === 1 ? "grid grid-cols-1" : "grid grid-cols-2 gap-1"
                )}>
                  {currentPost.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`Post image ${index + 1}`}
                      className={cn(
                        "w-full object-cover cursor-pointer hover:opacity-90 transition-opacity",
                        currentPost.images.length === 1 ? "max-h-[500px]" : "h-48"
                      )}
                      onClick={() => handleImageClick(index)}
                    />
                  ))}
                </div>
              )}

              {/* Stats Badges */}
              <div className="flex items-center gap-3 py-4 border-y border-border">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                  <Heart className="w-3.5 h-3.5 mr-1" />
                  {likesCount} Likes
                </Badge>
                <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">
                  <MessageCircle className="w-3.5 h-3.5 mr-1" />
                  {currentPost.comments?.length || 0} Comments
                </Badge>
                <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  {currentPost.views?.length || 0} Views
                </Badge>
                <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">
                  <Share2 className="w-3.5 h-3.5 mr-1" />
                  {sharesCount} Shares
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-around pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 flex-1 hover:bg-primary/10",
                    isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                  onClick={handleLike}
                >
                  <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                  Like
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 flex-1 text-muted-foreground hover:text-primary hover:bg-primary/10"
                >
                  <MessageCircle className="h-5 w-5" />
                  Comment
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 flex-1 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Comment Form */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mt-4 mx-4 border-border bg-card">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={user.avatar?.url} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      className="min-h-[80px] border-border focus-visible:ring-primary"
                    />
                    <div className="flex justify-end mt-3">
                      <Button
                        onClick={handleComment}
                        disabled={!commentContent.trim() || isSubmitting}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Posting...' : 'Comment'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mt-4 mx-4 border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Comments ({currentPost.comments?.length || 0})
                </h3>
                {currentPost.comments && currentPost.comments.length > 0 && (
                  <Select value={commentFilter} onValueChange={setCommentFilter}>
                    <SelectTrigger className="w-[140px] border-border">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="most-liked">Most Liked</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredComments && filteredComments.length > 0 ? (
                <div className="space-y-4">
                  {filteredComments.map((comment) => (
                    <CommentItem
                      key={comment._id}
                      comment={comment}
                      currentUser={user}
                      onLike={likeComment}
                      onReply={replyToComment}
                      onLikeReply={likeReply}
                      onEdit={handleEditComment}
                      onDelete={handleDeleteComment}
                      postId={postId}
                      onRefresh={() => getCommunityPostById(postId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">No comments yet</h4>
                  <p className="text-muted-foreground text-sm">
                    Be the first to share your thoughts!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Image Gallery */}
      {currentPost.images && currentPost.images.length > 0 && (
        <ImageGalleryModal
          images={currentPost.images}
          initialIndex={galleryIndex}
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </div>
  );
};

export default PostDetail;
