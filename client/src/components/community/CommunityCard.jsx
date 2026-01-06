import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import {
    Users,
    MapPin,
    Activity,
    Lock,
    Globe,
    Crown,
    Plus,
    ChevronRight,
    MessageSquare,
    TrendingUp,
    Sparkles,
    CheckCircle,
    Shield,
    Eye
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Community Card Component - Modern Design matching SportsBuddy theme
const CommunityCard = ({
    community,
    onJoin,
    isMember,
    isCreator,
    user,
    variant = "default" // default | compact | featured
}) => {
    const navigate = useNavigate()
    const [isHovered, setIsHovered] = useState(false)

    const handleCardClick = () => {
        navigate(`/community/${community._id}`)
    }

    const handleActionClick = (e, action) => {
        e.stopPropagation()
        action()
    }

    // Check if user is an admin
    const isAdmin = user?.role === 'admin'

    // Render action button based on user role and membership status
    const renderActionButton = () => {
        const buttonSize = variant === "compact" ? "sm" : "default"

        // Admin users (not member/creator) - show "View as Admin"
        if (isAdmin && !isCreator && !isMember) {
            return (
                <Button
                    onClick={(e) => handleActionClick(e, () => navigate(`/community/${community._id}`))}
                    className="w-full bg-primary/80 hover:bg-primary text-primary-foreground shadow-md"
                    size={buttonSize}
                >
                    <Shield className="w-4 h-4 mr-2" />
                    View as Admin
                </Button>
            )
        }

        // Creator - show "Manage Community"
        if (isCreator) {
            return (
                <Button
                    onClick={(e) => handleActionClick(e, () => navigate(`/community/${community._id}/edit`))}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                    size={buttonSize}
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Manage Community
                </Button>
            )
        }

        // Member - show "View Community"
        if (isMember) {
            return (
                <Button
                    onClick={(e) => handleActionClick(e, () => navigate(`/community/${community._id}`))}
                    variant="outline"
                    className="w-full border-2 border-primary text-primary hover:bg-primary/10"
                    size={buttonSize}
                >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    View Community
                </Button>
            )
        }

        // Logged in user (not member) - show "Join Community"
        if (user) {
            return (
                <Button
                    onClick={(e) => handleActionClick(e, () => onJoin(community._id))}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
                    size={buttonSize}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Join Community
                </Button>
            )
        }

        // Guest - show "Sign in to Join"
        return (
            <Button
                onClick={(e) => handleActionClick(e, () => navigate('/login'))}
                variant="outline"
                className="w-full border-2 border-primary text-primary hover:bg-primary/10"
                size={buttonSize}
            >
                <Eye className="w-4 h-4 mr-2" />
                Sign in to Join
            </Button>
        )
    }

    return (
        <Card
            className={cn(
                "group relative overflow-hidden border border-border bg-card hover:border-primary/50 transition-all duration-300 cursor-pointer",
                "hover:shadow-lg hover:shadow-primary/5",
                variant === "featured" && "md:col-span-2 lg:col-span-1",
                variant === "compact" && "flex flex-row"
            )}
            onClick={handleCardClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Section */}
            <div className={cn(
                "relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5",
                variant === "compact" ? "w-32 h-full flex-shrink-0" : "h-44 sm:h-48"
            )}>
                {community.image?.url ? (
                    <img
                        src={community.image.url}
                        alt={community.name}
                        className={cn(
                            "w-full h-full object-cover transition-transform duration-500",
                            isHovered && "scale-110"
                        )}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Featured Badge */}
                {community.isFeatured && (
                    <div className="absolute top-3 left-3 z-10">
                        <Badge className="bg-primary text-primary-foreground border-0 shadow-lg px-3 py-1">
                            <Crown className="w-3 h-3 mr-1.5" />
                            Featured
                        </Badge>
                    </div>
                )}

                {/* Privacy & Category Badges */}
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                    <Badge
                        variant="secondary"
                        className="bg-background/90 backdrop-blur-sm text-foreground border-0 shadow-sm"
                    >
                        {community.isPrivate ? (
                            <><Lock className="w-3 h-3 mr-1" /> Private</>
                        ) : (
                            <><Globe className="w-3 h-3 mr-1" /> Public</>
                        )}
                    </Badge>
                </div>

                {/* Category Badge - Bottom */}
                <div className="absolute bottom-3 left-3 z-10">
                    <Badge className="bg-primary text-primary-foreground shadow-md">
                        {community.category}
                    </Badge>
                </div>

                {/* Member Preview Avatars */}
                {community.recentMembers?.length > 0 && (
                    <div className="absolute bottom-3 right-3 flex -space-x-2 z-10">
                        {community.recentMembers.slice(0, 3).map((member, i) => (
                            <Avatar key={i} className="w-7 h-7 border-2 border-background shadow-sm">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                    {member.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {community.memberCount > 3 && (
                            <div className="w-7 h-7 rounded-full bg-primary/90 border-2 border-background flex items-center justify-center">
                                <span className="text-[10px] font-bold text-primary-foreground">
                                    +{community.memberCount - 3}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <CardContent className={cn(
                "flex flex-col",
                variant === "compact" ? "p-4 flex-1" : "p-5"
            )}>
                {/* Title & Description */}
                <div className="mb-4">
                    <h3 className={cn(
                        "font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors",
                        variant === "compact" ? "text-base" : "text-lg"
                    )}>
                        {community.name}
                    </h3>
                    <p className={cn(
                        "text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed",
                        variant === "compact" ? "text-xs" : "text-sm"
                    )}>
                        {community.description}
                    </p>
                </div>

                {/* Stats Row */}
                <div className={cn(
                    "flex items-center gap-4 text-sm mb-4",
                    variant === "compact" && "gap-3 text-xs"
                )}>
                    <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded-md bg-primary/10">
                            <Users className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground">{community.memberCount || 0}</span>
                        <span className="text-muted-foreground hidden sm:inline">members</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded-md bg-green-500/10">
                            <MessageSquare className="w-3.5 h-3.5 text-green-500" />
                        </div>
                        <span className="font-semibold text-foreground">{community.stats?.totalPosts || 0}</span>
                        <span className="text-muted-foreground hidden sm:inline">posts</span>
                    </div>
                    {community.stats?.activeToday > 0 && (
                        <div className="flex items-center gap-1.5">
                            <div className="p-1 rounded-md bg-orange-500/10">
                                <Activity className="w-3.5 h-3.5 text-orange-500" />
                            </div>
                            <span className="font-semibold text-foreground">{community.stats.activeToday}</span>
                            <span className="text-muted-foreground hidden sm:inline">active</span>
                        </div>
                    )}
                </div>

                {/* Location */}
                {community.location?.city && variant !== "compact" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{community.location.city}, {community.location.country}</span>
                    </div>
                )}

                {/* Creator Info */}
                {community.creator && variant !== "compact" && (
                    <div className="flex items-center gap-2.5 py-3 px-3 rounded-lg bg-muted/50 mb-4">
                        <Avatar className="w-8 h-8 border border-border">
                            <AvatarImage src={community.creator.avatar} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {community.creator.name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <span className="text-xs text-muted-foreground">Created by</span>
                            <p className="text-sm font-medium text-foreground truncate">
                                {community.creator.name}
                            </p>
                        </div>
                        {community.createdAt && (
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}
                            </span>
                        )}
                    </div>
                )}

                {/* Action Button */}
                <div className="mt-auto">
                    {renderActionButton()}
                </div>
            </CardContent>

            {/* Hover Indicator */}
            <div className={cn(
                "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-400 transition-all duration-300",
                isHovered ? "opacity-100" : "opacity-0"
            )} />
        </Card>
    )
}

export default CommunityCard
