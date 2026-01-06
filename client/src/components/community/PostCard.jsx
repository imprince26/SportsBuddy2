import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Eye, MoreVertical, Bookmark, Edit2, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const PostCard = ({
  post,
  currentUser,
  onLike,
  onShare,
  onDelete,
  onEdit,
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
      className="cursor-pointer border-border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-300"
      onClick={handleCardClick}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <Link
              to={`/profile/${author._id || author.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="h-11 w-11 border border-border">
                <AvatarImage src={authorAvatar} alt={authorName} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {authorName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex sm:flex-row flex-col sm:items-center sm:gap-2">
                <Link
                  to={`/profile/${author._id || author.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {authorName}
                </Link>

                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <span>@{authorUsername}</span>
                  <span>·</span>
                  <span>
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {post.community && (
                <Link
                  to={`/community/${post.community._id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  {post.community.name}
                </Link>
              )}
            </div>
          </div>

          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save post
                </DropdownMenuItem>
                {currentUser.id === (author._id || author.id) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(post);
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit post
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(post._id);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete post
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-base text-foreground whitespace-pre-wrap break-words leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`mb-4 ${getImageContainerClass(post.images.length)}`}>
            {post.images.slice(0, 4).map((image, index) => (
              <div key={index} className="relative overflow-hidden rounded-lg">
                <img
                  src={image.url}
                  alt={`Post image ${index + 1}`}
                  className={cn(getImageClass(index, post.images.length), "hover:scale-105 transition-transform duration-300")}
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
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 hover:bg-primary/10",
              isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
            onClick={handleLike}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            <span className="text-sm font-medium">{likesCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{post.comments?.length || 0}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            <span className="text-sm font-medium">{post.shares || 0}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">{post.views?.length || 0}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
