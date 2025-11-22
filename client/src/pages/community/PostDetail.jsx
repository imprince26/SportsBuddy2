import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, MessageCircle, Share2, Eye, Send, Filter, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useCommunity } from '../../hooks/useCommunity';
import { useAuth } from '../../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Separator } from '../../components/ui/separator';
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
import Loader from '../../components/Loader';
import ImageGalleryModal from '../../components/community/ImageGalleryModal';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const CommentItem = ({ comment, currentUser, onLike, onReply, onLikeReply, onEdit, onDelete, level = 0, postId, onRefresh, parentCommentId }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [isLiked, setIsLiked] = useState(
    comment.likes?.some(like => like.user === currentUser?.id || like.user?._id === currentUser?.id)
  );
  const [localLikesCount, setLocalLikesCount] = useState(comment.likes?.length || 0);

  // Sync local state when comment data changes
  useEffect(() => {
    setIsLiked(comment.likes?.some(like => like.user === currentUser?.id || like.user?._id === currentUser?.id));
    setLocalLikesCount(comment.likes?.length || 0);
  }, [comment.likes, currentUser]);

  const handleLike = async () => {
    if (!currentUser) {
      toast.error('Please login to like comments');
      return;
    }
    
    // Optimistic UI update - instant feedback
    const wasLiked = isLiked;
    const previousCount = localLikesCount;
    
    setIsLiked(!wasLiked);
    setLocalLikesCount(prev => wasLiked ? prev - 1 : prev + 1);
    
    // Background API call - no await, no page refresh
    (async () => {
      try {
        // If this is a reply (level > 0), use likeReply, otherwise use likeComment
        if (level > 0 && parentCommentId && onLikeReply) {
          await onLikeReply(postId, parentCommentId, comment._id);
        } else {
          await onLike(postId, comment._id);
        }
        // Silently succeed - UI already updated
      } catch (error) {
        // Revert on error
        setIsLiked(wasLiked);
        setLocalLikesCount(previousCount);
        toast.error('Failed to update like');
        console.error('Like error:', error);
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
        // Wait a bit for server to update then refresh
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

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
    <div className={`${level > 0 ? 'ml-12 mt-3' : 'mt-4'}`}>
      <div className="flex gap-3">
        <Link to={`/profile/${author._id || author.id}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={author.avatar?.url} alt={authorName} />
            <AvatarFallback>{authorName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1">
          <div className="bg-card/80 border border-border/30 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/profile/${author._id || author.id}`}
                  className="font-semibold text-sm hover:underline"
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
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-3 w-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
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
                  className="min-h-[60px] text-sm"
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
              <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>
            )}
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                isLiked ? 'text-red-500' : ''
              }`}
            >
              <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
              <span>{localLikesCount}</span>
            </button>
            {level < 2 && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="hover:text-primary transition-colors"
              >
                Reply
              </button>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-3 flex gap-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px]"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
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
    </div>
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
    if (!commentContent.trim()) return;
    
    try {
      const result = await addCommentToPost(postId, commentContent);
      if (result && result.success) {
        setCommentContent('');
        // Refresh post data immediately to show new comment
        await getCommunityPostById(postId);
        toast.success('Comment added successfully!');
      }
    } catch (error) {
      toast.error('Failed to add comment');
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

      // Try Web Share API first
      if (navigator.share) {
        await navigator.share(shareData);
        const result = await sharePost(postId);
        if (result && result.success) {
          setSharesCount(result.data.shares);
        }
        toast.success('Post shared successfully!');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        const result = await sharePost(postId);
        if (result && result.success) {
          setSharesCount(result.data.shares);
        }
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      if (error.name !== 'AbortError') {
        toast.error('Failed to share post');
      }
    }
  };

  const handleEditComment = async (postId, parentCommentId, commentId, content) => {
    if (parentCommentId) {
      // It's a reply
      await updateReplyContent(postId, parentCommentId, commentId, content);
    } else {
      // It's a comment
      await updateCommentContent(postId, commentId, content);
    }
  };

  const handleDeleteComment = async (postId, parentCommentId, commentId) => {
    if (parentCommentId) {
      // It's a reply
      await deleteReplyContent(postId, parentCommentId, commentId);
    } else {
      // It's a comment
      await deleteCommentContent(postId, commentId);
    }
  };

  const handleImageClick = (index) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  if (loading) {
    return <Loader />;
  }

  if (!currentPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Post not found</h2>
          <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
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
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Post</h1>
          </div>
        </div>

        {/* Post Content */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-xl mt-4 mx-4">
          <div className="p-6">
            {/* Author Info */}
            <div className="flex items-start gap-3 mb-4">
              <Link to={`/profile/${author._id || author.id}`}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={author.avatar?.url} alt={authorName} />
                  <AvatarFallback>{authorName[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>

              <div>
                <Link
                  to={`/profile/${author._id || author.id}`}
                  className="font-semibold hover:underline"
                >
                  {authorName}
                </Link>
                <p className="text-sm text-muted-foreground">
                  @{author.username || 'user'}
                </p>
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

            {/* Content */}
            <p className="text-lg mb-4 whitespace-pre-wrap break-words">
              {currentPost.content}
            </p>

            {/* Images */}
            {currentPost.images && currentPost.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {currentPost.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`Post image ${index + 1}`}
                    className="max-h-96 w-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(index)}
                  />
                ))}
              </div>
            )}

            {/* Time */}
            <p className="text-sm text-muted-foreground mb-4">
              {new Date(currentPost.createdAt).toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>

            <Separator className="my-4" />

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm mb-4">
              <div>
                <span className="font-bold">{likesCount}</span>{' '}
                <span className="text-muted-foreground">Likes</span>
              </div>
              <div>
                <span className="font-bold">{currentPost.comments?.length || 0}</span>{' '}
                <span className="text-muted-foreground">Comments</span>
              </div>
              <div>
                <span className="font-bold">{currentPost.views?.length || 0}</span>{' '}
                <span className="text-muted-foreground">Views</span>
              </div>
              <div>
                <span className="font-bold">{sharesCount}</span>{' '}
                <span className="text-muted-foreground">Shares</span>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Actions */}
            <div className="flex items-center justify-around">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 ${isLiked ? 'text-red-500' : ''}`}
                onClick={handleLike}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </Button>

              <Button variant="ghost" size="sm" className="gap-2">
                <MessageCircle className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="sm" className="gap-2">
                <Eye className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Comment Form */}
        {user && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-md mt-4 mx-4 p-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar?.url} alt={user.name} />
                <AvatarFallback>{user.name[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="min-h-[80px] mb-2"
                />
                <div className="flex justify-end">
                  <Button onClick={handleComment} disabled={!commentContent.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Comments */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-md mt-4 mx-4 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">
              Comments ({currentPost.comments?.length || 0})
            </h3>
            {currentPost.comments && currentPost.comments.length > 0 && (
              <Select value={commentFilter} onValueChange={setCommentFilter}>
                <SelectTrigger className="w-[140px]">
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
            <p className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to comment!
            </p>
          )}
        </Card>
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
