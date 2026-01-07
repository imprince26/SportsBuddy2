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
            className="relative mt-14 sm:mt-0"
        >
            {/* Cover Image */}
            <div className="h-56 md:h-72 lg:h-96 relative overflow-hidden">
                {community.image?.url ? (
                    <img
                        src={community.image.url}
                        alt={community.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center">
                        <Users className="w-24 h-24 text-white/20" />
                    </div>
                )}

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
            </div>

            {/* Community Info */}
            <div className="absolute bottom-0 left-0 right-0">
                <div className="container mx-auto px-4 pb-6 md:pb-8">
                    <div className="flex flex-row md:items-end gap-4 md:gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-background shadow-xl overflow-hidden flex-shrink-0 bg-card">
                            {community.image?.url ? (
                                <img
                                    src={community.image.url}
                                    alt={community.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                                    <Users className="w-12 h-12 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl md:text-4xl font-black text-white">
                                    {community.name}
                                </h1>
                                <Badge
                                    variant="secondary"
                                    className="flex-shrink-0 bg-white/20 text-white border-white/30 backdrop-blur-sm"
                                >
                                    {community.isPrivate ? (
                                        <><Lock className="w-3 h-3 mr-1" /> Private</>
                                    ) : (
                                        <><Globe className="w-3 h-3 mr-1" /> Public</>
                                    )}
                                </Badge>
                            </div>

                            {/* Stats Row */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                                <div className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4" />
                                    <span className="font-semibold">{community.memberCount || 0}</span>
                                    <span className="hidden sm:inline">members</span>
                                </div>
                                {community.location?.city && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" />
                                        <span>{community.location.city}, {community.location.state || community.location.country}</span>
                                    </div>
                                )}
                                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                    {community.category}
                                </Badge>
                            </div>

                            {/* Role Badges - Using only primary colors */}
                            <div className="flex items-center gap-2 mt-3">
                                {isCreator && (
                                    <Badge className="bg-primary text-primary-foreground border-0">
                                        <Crown className="w-3 h-3 mr-1" />
                                        Creator
                                    </Badge>
                                )}
                                {isAdmin && !isCreator && (
                                    <Badge className="bg-primary/80 text-primary-foreground border-0">
                                        <Shield className="w-3 h-3 mr-1" />
                                        Admin
                                    </Badge>
                                )}
                                {isModerator && !isCreator && (
                                    <Badge variant="secondary" className="border-primary/30">
                                        <Shield className="w-3 h-3 mr-1" />
                                        Moderator
                                    </Badge>
                                )}
                                {community.isMember && !isCreator && !isModerator && (
                                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                        Member
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                                variant="secondary"
                                size={isMobile ? "sm" : "default"}
                                onClick={onShare}
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
                                                    size={isMobile ? "sm" : "default"}
                                                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
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
                                            size={isMobile ? "sm" : "default"}
                                            onClick={() => community.isPrivate ? onShowJoinDialog() : onJoin()}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            {!isMobile && (
                                                <span className="ml-2">
                                                    {community.isPrivate ? 'Request to Join' : 'Join Community'}
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
    )
}

export default CommunityHeroSection
