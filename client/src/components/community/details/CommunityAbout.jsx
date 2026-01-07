import { formatDistanceToNow } from "date-fns"
import {
    MapPin,
    Calendar,
    Clock,
    Shield,
    ChevronDown,
    ChevronUp,
    Info,
    Link as LinkIcon,
    Users,
    ExternalLink
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { Link } from "react-router-dom"

// About Section - Full Version (Using primary colors only)
export const CommunityAboutSection = ({ community }) => {
    const [showAllRules, setShowAllRules] = useState(false)

    return (
        <div className="space-y-6">
            {/* Description Card */}
            <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary" />
                        About This Community
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                        {community.description}
                    </p>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Calendar className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Created</p>
                                <p className="text-sm font-medium text-foreground">
                                    {community.createdAt
                                        ? formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })
                                        : 'Unknown'
                                    }
                                </p>
                            </div>
                        </div>

                        {community.location?.city && (
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <MapPin className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Location</p>
                                    <p className="text-sm font-medium text-foreground">
                                        {community.location.city}, {community.location.country}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Users className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Category</p>
                                <p className="text-sm font-medium text-foreground">
                                    {community.category}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Clock className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Activity</p>
                                <p className="text-sm font-medium text-foreground">Very Active</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Creator Card */}
            {community.creator && (
                <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">Community Founder</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Link
                            to={`/profile/${community.creator._id}`}
                            className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                        >
                            <Avatar className="w-14 h-14 border-2 border-primary">
                                <AvatarImage src={community.creator.avatar?.url || community.creator.avatar} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                                    {community.creator.name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold text-foreground">{community.creator.name}</p>
                                <Badge className="mt-1 bg-primary text-primary-foreground border-0">
                                    <Users className="w-3 h-3 mr-1" />
                                    Founder
                                </Badge>
                            </div>
                            <ExternalLink className="w-5 h-5 text-muted-foreground" />
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Community Rules */}
            {community.rules && community.rules.length > 0 && (
                <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            Community Rules
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {(showAllRules ? community.rules : community.rules.slice(0, 4)).map((rule, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className="font-medium text-foreground">{rule.title || rule}</p>
                                        {rule.description && (
                                            <p className="text-sm text-muted-foreground mt-0.5">{rule.description}</p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {community.rules.length > 4 && (
                            <Button
                                variant="ghost"
                                className="w-full mt-4 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowAllRules(!showAllRules)}
                            >
                                {showAllRules ? (
                                    <>Show Less <ChevronUp className="w-4 h-4 ml-2" /></>
                                ) : (
                                    <>Show All {community.rules.length} Rules <ChevronDown className="w-4 h-4 ml-2" /></>
                                )}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Links */}
            {community.links && community.links.length > 0 && (
                <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <LinkIcon className="w-5 h-5 text-primary" />
                            Useful Links
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {community.links.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4 text-primary" />
                                    <span className="flex-1 font-medium text-foreground">{link.title || link.url}</span>
                                </a>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

// Compact About Card for Sidebar
export const CommunityAboutCard = ({ community }) => {
    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-4">
                    {community.description}
                </p>

                <div className="space-y-3">
                    {community.location?.city && (
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">{community.location.city}, {community.location.country}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">
                            Created {community.createdAt
                                ? formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })
                                : 'Unknown'
                            }
                        </span>
                    </div>
                </div>

                {/* Category Badge */}
                <Badge className="bg-primary/10 text-primary border-0">
                    {community.category}
                </Badge>
            </CardContent>
        </Card>
    )
}

export default {
    CommunityAboutSection,
    CommunityAboutCard
}
