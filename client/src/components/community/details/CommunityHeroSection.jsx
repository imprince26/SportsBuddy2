import { motion } from "framer-motion"
import {
    Users,
    MapPin,
    Lock,
    Globe,
    Share2,
    MoreHorizontal,
    Edit3,
    Settings,
    Trash2,
    UserMinus,
    UserPlus,
    Shield,
    Crown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Hero Section Component - Using only primary brand colors
const CommunityHeroSection = ({
    community,
    user,
    isMobile,
    onShare,
    onJoin,
    onShowJoinDialog,
    onShowLeaveDialog,
    onShowDeleteDialog,
    onNavigateEdit,
    onNavigateManage
}) => {
    const isCreator = community.isCreator
    const isAdmin = community.admins?.some(a => a._id === user?.id || a === user?.id)
    const isModerator = community.moderators?.some(m => m._id === user?.id || m === user?.id)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mt-1"
        >
            {/* Cover Image */}
            <div className="h-48 md:h-64 lg:h-80 relative overflow-hidden">
                {community.image?.url ? (
                    <img
                        src={community.image.url}
                        alt={community.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center">
                        <Users className="w-16 h-16 sm:w-24 sm:h-24 text-white/20" />
                    </div>
                )}

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
            </div>

            {/* Community Info */}
            <div className="relative sm:absolute sm:bottom-0 sm:left-0 sm:right-0 -mt-10 sm:mt-0">
                <div className="container mx-auto px-3 sm:px-4 pb-4 sm:pb-6 md:pb-8">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 md:gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-xl sm:rounded-2xl border-3 sm:border-4 border-background shadow-xl overflow-hidden flex-shrink-0 bg-card mx-auto sm:mx-0">
                            {community.image?.url ? (
                                <img
                                    src={community.image.url}
                                    alt={community.name}
                                    className="w-full h-full object-cover"
                                />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                                        <Users className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 text-center sm:text-left bg-background sm:bg-transparent p-4 sm:p-0 rounded-t-2xl sm:rounded-none -mt-2 sm:mt-0">
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-2">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-foreground sm:text-white break-words w-full sm:w-auto">
                                        {community.name}
                                    </h1>
                                    <Badge
                                        variant="secondary"
                                        className="flex-shrink-0 bg-muted sm:bg-white/20 text-foreground sm:text-white border-border sm:border-white/30 backdrop-blur-sm text-xs sm:text-sm"
                                    >
                                        {community.isPrivate ? (
                                            <><Lock className="w-3 h-3 mr-1" /> Private</>
                                        ) : (
                                            <><Globe className="w-3 h-3 mr-1" /> Public</>
                                        )}
                                    </Badge>
                                </div>

                                {/* Stats Row */}
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-muted-foreground sm:text-white/90">
                                    <div className="flex items-center gap-1 sm:gap-1.5">
                                        <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                        <span className="font-semibold">{community.memberCount || 0}</span>
                                        <span className="hidden xs:inline">member{community.memberCount !== 1 ? 's' : ''}</span>
                                    </div>
                                    {community.location?.city && (
                                        <div className="flex items-center gap-1 sm:gap-1.5 truncate max-w-[200px]">
                                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="truncate">{community.location.city}{community.location.state && `, ${community.location.state}`}</span>
                                        </div>
                                    )}
                                    <Badge className="bg-muted sm:bg-white/20 text-foreground sm:text-white border-border sm:border-white/30 backdrop-blur-sm text-xs flex-shrink-0">
                                        {community.category}
                                    </Badge>
                                </div>

                                {/* Role Badges - Using only primary colors */}
                                <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mt-2 sm:mt-3 flex-wrap">
                                    {isCreator && (
                                        <Badge className="bg-primary text-primary-foreground border-0 text-xs">
                                            <Crown className="w-3 h-3 mr-1" />
                                            Creator
                                        </Badge>
                                    )}
                                    {isAdmin && !isCreator && (
                                        <Badge className="bg-primary/80 text-primary-foreground border-0 text-xs">
                                            <Shield className="w-3 h-3 mr-1" />
                                            Admin
                                        </Badge>
                                    )}
                                    {isModerator && !isCreator && (
                                        <Badge variant="secondary" className="border-primary/30 text-xs">
                                            <Shield className="w-3 h-3 mr-1" />
                                            Moderator
                                        </Badge>
                                    )}
                                    {community.isMember && !isCreator && !isModerator && (
                                        <Badge variant="secondary" className="bg-muted sm:bg-white/20 text-foreground sm:text-white border-border sm:border-white/30 text-xs">
                                            Member
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-center sm:justify-end px-4 sm:px-0 pb-4 sm:pb-0">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={onShare}
                                    className="bg-muted sm:bg-white/20 backdrop-blur-sm border-border sm:border-white/30 text-foreground sm:text-white hover:bg-muted/80 sm:hover:bg-white/30 flex-1 sm:flex-none"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span className="ml-2">Share</span>
                                </Button>

                                {user && (
                                    <>
                                        {community.isMember ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        className="bg-muted sm:bg-white/20 backdrop-blur-sm border-border sm:border-white/30 text-foreground sm:text-white hover:bg-muted/80 sm:hover:bg-white/30"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-52">
                                                {/* Admin/Moderator Options */}
                                                {community.canManage && (
                                                    <>
                                                        <DropdownMenuItem onClick={onNavigateEdit} className="gap-2">
                                                            <Edit3 className="w-4 h-4" />
                                                            Edit Community
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={onNavigateManage} className="gap-2">
                                                            <Settings className="w-4 h-4" />
                                                            Manage Members
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                    </>
                                                )}

                                                {/* Options for all members */}
                                                {!isCreator && (
                                                    <DropdownMenuItem
                                                        onClick={onShowLeaveDialog}
                                                        className="gap-2 text-destructive focus:text-destructive"
                                                    >
                                                        <UserMinus className="w-4 h-4" />
                                                        Leave Community
                                                    </DropdownMenuItem>
                                                )}

                                                {/* Creator-only option */}
                                                {isCreator && (
                                                    <DropdownMenuItem
                                                        onClick={onShowDeleteDialog}
                                                        className="gap-2 text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete Community
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : null}

                                        {/* Join Button - Only show if not member and not creator */}
                                        {!community.isMember && !isCreator && (
                                            <Button
                                                size="sm"
                                                onClick={() => community.isPrivate ? onShowJoinDialog() : onJoin()}
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex-1 sm:flex-none"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                                <span className="ml-2">
                                                    {community.isPrivate ? 'Request' : 'Join'}
                                                </span>
                                            </Button>
                                        )}
                                    </>
                                )}

                                {/* Guest Sign In Button */}
                                {!user && (
                                    <Button
                                        size="sm"
                                        onClick={() => window.location.href = '/login'}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex-1 sm:flex-none"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span className="ml-2">Sign In to Join</span>
                                    </Button>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default CommunityHeroSection
