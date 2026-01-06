import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import {
    Users,
    Crown,
    Shield,
    UserPlus,
    Search,
    ChevronRight,
    MoreHorizontal,
    UserMinus
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Helper function to extract member data - handles different API response formats
const getMemberData = (member) => {
    // If member has a nested user object
    if (member?.user && typeof member.user === 'object') {
        return {
            _id: member.user._id || member.user.id || member._id,
            name: member.user.name || member.user.username || 'Unknown User',
            username: member.user.username || member.user.name,
            avatar: member.user.avatar?.url || member.user.avatar || member.avatar,
            joinedAt: member.joinedAt || member.createdAt
        }
    }
    // Normal member object
    return {
        _id: member._id || member.id,
        name: member.name || member.username || 'Unknown User',
        username: member.username || member.name,
        avatar: member.avatar?.url || member.avatar,
        joinedAt: member.joinedAt || member.createdAt
    }
}

// Member Card Component
const MemberCard = ({ member, role, isCurrentUser, canManage, onRemove, onPromote }) => {
    const memberData = getMemberData(member)

    const getRoleBadge = () => {
        switch (role) {
            case 'creator':
                return (
                    <Badge className="bg-primary text-primary-foreground border-0">
                        <Crown className="w-3 h-3 mr-1" />
                        Creator
                    </Badge>
                )
            case 'admin':
                return (
                    <Badge className="bg-primary/80 text-primary-foreground border-0">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                    </Badge>
                )
            case 'moderator':
                return (
                    <Badge variant="secondary" className="border-primary/30">
                        <Shield className="w-3 h-3 mr-1" />
                        Moderator
                    </Badge>
                )
            default:
                return null
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
        >
            <Link to={`/profile/${memberData._id}`} className="flex-shrink-0">
                <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                    <AvatarImage src={memberData.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {memberData.name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <Link
                        to={`/profile/${memberData._id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                    >
                        {memberData.name}
                    </Link>
                    {isCurrentUser && (
                        <Badge variant="outline" className="text-xs border-primary/30 text-primary">You</Badge>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {getRoleBadge()}
                    {memberData.joinedAt && (
                        <span className="text-xs text-muted-foreground">
                            Joined {formatDistanceToNow(new Date(memberData.joinedAt), { addSuffix: true })}
                        </span>
                    )}
                </div>
            </div>

            {canManage && !isCurrentUser && role !== 'creator' && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {onPromote && (
                            <DropdownMenuItem onClick={() => onPromote(memberData._id)}>
                                <Shield className="w-4 h-4 mr-2" />
                                Make Moderator
                            </DropdownMenuItem>
                        )}
                        {onRemove && (
                            <DropdownMenuItem
                                onClick={() => onRemove(memberData._id)}
                                className="text-destructive"
                            >
                                <UserMinus className="w-4 h-4 mr-2" />
                                Remove Member
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </motion.div>
    )
}

// Members List Component with ScrollArea
const CommunityMembersList = ({
    members = [],
    admins = [],
    moderators = [],
    creator,
    currentUser,
    canManage,
    onRemoveMember,
    onPromoteMember,
    onInvite,
    showAll = false,
    onShowAll
}) => {
    // Process creator data
    const processedCreator = creator ? { ...getMemberData(creator), role: 'creator', originalData: creator } : null

    // Combine all special roles for display
    const allMembers = [
        ...(processedCreator ? [processedCreator] : []),
        ...admins.map(a => ({ ...getMemberData(a), role: 'admin', originalData: a })),
        ...moderators.map(m => ({ ...getMemberData(m), role: 'moderator', originalData: m })),
        ...members.filter(m => {
            const mData = getMemberData(m)
            const creatorData = processedCreator
            return mData._id !== creatorData?._id &&
                !admins.some(a => getMemberData(a)._id === mData._id) &&
                !moderators.some(mod => getMemberData(mod)._id === mData._id)
        }).map(m => ({ ...getMemberData(m), role: 'member', originalData: m }))
    ]

    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Members ({allMembers.length})
                    </CardTitle>
                    {canManage && onInvite && (
                        <Button size="sm" variant="outline" onClick={onInvite}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Invite
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search members..."
                        className="pl-9 bg-muted/50 border-border"
                    />
                </div>

                {/* Members List with ScrollArea */}
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                        {allMembers.map((member) => (
                            <MemberCard
                                key={member._id}
                                member={member.originalData || member}
                                role={member.role}
                                isCurrentUser={currentUser?.id === member._id || currentUser?._id === member._id}
                                canManage={canManage}
                                onRemove={onRemoveMember}
                                onPromote={onPromoteMember}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

// Compact Members Preview for Sidebar
export const MembersPreviewCard = ({
    members = [],
    totalCount = 0,
    creator,
    onViewAll
}) => {
    const creatorData = creator ? getMemberData(creator) : null
    const displayMembers = [
        ...(creatorData ? [{ ...creatorData, isCreator: true }] : []),
        ...members.filter(m => getMemberData(m)._id !== creatorData?._id).slice(0, 5).map(m => getMemberData(m))
    ].slice(0, 6)

    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Members
                    </div>
                    <span className="text-sm font-normal text-muted-foreground">
                        {totalCount}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                    {displayMembers.map((member, i) => (
                        <Link key={member._id || i} to={`/profile/${member._id}`}>
                            <Avatar className={cn(
                                "w-10 h-10 border-2 border-background shadow-sm hover:scale-110 transition-transform",
                                member.isCreator && "ring-2 ring-primary"
                            )}>
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                    ))}
                    {totalCount > 6 && (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">+{totalCount - 6}</span>
                        </div>
                    )}
                </div>
                <Button
                    variant="outline"
                    className="w-full border-border hover:border-primary/50"
                    onClick={onViewAll}
                >
                    View All Members
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </CardContent>
        </Card>
    )
}

export default CommunityMembersList
