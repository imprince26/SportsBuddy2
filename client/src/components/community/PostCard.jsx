import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Eye, MoreVertical, Bookmark } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({
  post,
  currentUser,
  onLike,
  onShare,
  onDelete,
  onImageClick,
}) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(
    post.likes?.some(like => like.user === currentUser?.id || like.user?._id === currentUser?.id)
  );
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);

  const handleLike = async (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    await onLike(post._id);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    await onShare(post._id);
  };

  const handleCardClick = () => {
    navigate(`/community/post/${post._id}`);
  };

  const author = post.author || {};
  const authorName = author.name || author.username || 'Unknown User';
  const authorAvatar = author.avatar?.url || '';
  const authorUsername = author.username || 'user';

  // Fixed image dimensions
  const getImageContainerClass = (imageCount) => {
    if (imageCount === 1) return 'grid grid-cols-1';
    if (imageCount === 2) return 'grid grid-cols-2 gap-1';
    if (imageCount === 3) return 'grid grid-cols-2 gap-1';
    return 'grid grid-cols-2 gap-1';
  };

  const getImageClass = (index, total) => {
    if (total === 1) return 'max-h-96 w-full object-cover rounded-lg';
    if (total === 3 && index === 0) return 'row-span-2 max-h-80 w-full object-cover rounded-lg';
    return 'max-h-40 w-full object-cover rounded-lg';
  };

  return (
    <Card
      className="hover:bg-accent/5 transition-colors cursor-pointer border-b border-x-0 border-t-0 rounded-none"
      onClick={handleCardClick}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <Link
              to={`/profile/${author._id || author.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={authorAvatar} alt={authorName} />
                <AvatarFallback>{authorName[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  to={`/profile/${author._id || author.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold hover:underline"
                >
                  {authorName}
                </Link>
                <span className="text-muted-foreground text-sm">
                  @{authorUsername}
                </span>
                <span className="text-muted-foreground text-sm">·</span>
                <span className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>

              {post.community && (
                <Link
                  to={`/community/${post.community._id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  {post.community.name}
                </Link>
              )}
            </div>
          </div>

          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save post
                </DropdownMenuItem>
                {currentUser.id === (author._id || author.id) && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(post._id);
                    }}
                    className="text-destructive"
                  >
                    Delete post
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-base whitespace-pre-wrap break-words">{post.content}</p>
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`mb-3 ${getImageContainerClass(post.images.length)}`}>
            {post.images.slice(0, 4).map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image.url}
                  alt={`Post image ${index + 1}`}
                  className={getImageClass(index, post.images.length)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageClick?.(post.images, index);
                  }}
                />
                {post.images.length > 4 && index === 3 && (
                  <div
                    className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageClick?.(post.images, 3);
                    }}
                  >
                    <span className="text-white text-2xl font-semibold">
                      +{post.images.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${isLiked ? 'text-red-500' : ''}`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{likesCount}</span>
          </Button>

          <Button variant="ghost" size="sm" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{post.comments?.length || 0}</span>
          </Button>

          <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            <span className="text-sm">{post.shares || 0}</span>
          </Button>

          <Button variant="ghost" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            <span className="text-sm">{post.views?.length || 0}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
