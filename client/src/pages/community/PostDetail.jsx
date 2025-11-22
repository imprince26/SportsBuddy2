import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, MessageCircle, Share2, Eye, Send } from 'lucide-react';
import { useCommunity } from '../../hooks/useCommunity';
import { useAuth } from '../../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Separator } from '../../components/ui/separator';
import Loader from '../../components/Loader';
import ImageGalleryModal from '../../components/community/ImageGalleryModal';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const CommentItem = ({ comment, currentUser, onLike, onReply, level = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isLiked, setIsLiked] = useState(
    comment.likes?.some(like => like.user === currentUser?.id || like.user?._id === currentUser?.id)
  );

  const handleLike = async () => {
    setIsLiked(!isLiked);
    await onLike(comment._id);
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    await onReply(comment._id, replyContent);
    setReplyContent('');
    setShowReplyForm(false);
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
          <div className="bg-accent/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Link
                to={`/profile/${author._id || author.id}`}
                className="font-semibold text-sm hover:underline"
              >
                {authorName}
              </Link>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                isLiked ? 'text-red-500' : ''
              }`}
            >
              <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
              <span>{comment.likes?.length || 0}</span>
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
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
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
    sharePost,
    incrementPostView,
  } = useCommunity();

  const [commentContent, setCommentContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

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
    }
  }, [currentPost, user]);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    await likeCommunityPost(postId);
  };

  const handleComment = async () => {
    if (!commentContent.trim()) return;
    await addCommentToPost(postId, commentContent);
    setCommentContent('');
    getCommunityPostById(postId);
  };

  const handleShare = async () => {
    await sharePost(postId);
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
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
        <Card className="border-x-0 border-t-0 rounded-none">
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
                <span className="font-bold">{currentPost.shares || 0}</span>{' '}
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
          <Card className="border-x-0 border-t-0 rounded-none p-4">
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
        <Card className="border-x-0 border-t-0 rounded-none p-4">
          <h3 className="font-semibold text-lg mb-4">
            Comments ({currentPost.comments?.length || 0})
          </h3>
          {currentPost.comments && currentPost.comments.length > 0 ? (
            <div className="space-y-4">
              {currentPost.comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  currentUser={user}
                  onLike={likeComment}
                  onReply={replyToComment}
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
