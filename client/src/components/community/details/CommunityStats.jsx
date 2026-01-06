import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import {
    Users,
    MessageSquare,
    Activity,
    TrendingUp,
    Calendar,
    Eye
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// Community Stats Card - Using only primary brand color
export const CommunityStatsCard = ({ community }) => {
    const stats = [
        {
            icon: Users,
            label: "Members",
            value: community.memberCount || 0
        },
        {
            icon: MessageSquare,
            label: "Posts",
            value: community.stats?.totalPosts || 0
        },
        {
            icon: Activity,
            label: "Active Today",
            value: community.stats?.activeToday || 0
        },
        {
            icon: Eye,
            label: "Views",
            value: community.stats?.views || 0
        }
    ]

    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Community Stats
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {stats.map((stat, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <stat.icon className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm text-muted-foreground">{stat.label}</span>
                        </div>
                        <span className="font-bold text-foreground">{stat.value}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

// Community Growth Card - Primary colors only
export const CommunityGrowthCard = ({ community }) => {
    const growthPercentage = Math.min(100, ((community.memberCount || 0) / 100) * 100)

    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Growth
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Member Growth</span>
                        <span className="font-medium text-foreground">{community.memberCount || 0} members</span>
                    </div>
                    <Progress value={growthPercentage} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-primary/10 text-center">
                        <div className="text-lg font-bold text-primary">
                            +{community.stats?.newMembersThisWeek || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">This Week</div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 text-center">
                        <div className="text-lg font-bold text-primary">
                            +{community.stats?.newPostsThisWeek || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">New Posts</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Community Info Card
export const CommunityInfoCard = ({ community }) => {
    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {community.description}
                </p>

                <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">Created</span>
                        <span className="ml-auto font-medium text-foreground">
                            {community.createdAt
                                ? formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })
                                : 'Unknown'
                            }
                        </span>
                    </div>

                    {community.creator && (
                        <div className="flex items-center gap-3 text-sm">
                            <Users className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">Founded by</span>
                            <span className="ml-auto font-medium text-foreground">
                                {community.creator.name}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

// Quick Stats Row (for hero section) - Primary color only
export const CommunityQuickStats = ({ community }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
                { icon: Users, value: community.memberCount || 0, label: "Members" },
                { icon: MessageSquare, value: community.stats?.totalPosts || 0, label: "Posts" },
                { icon: Activity, value: community.stats?.activeToday || 0, label: "Active Today" },
                { icon: Calendar, value: community.stats?.eventsCount || 0, label: "Events" }
            ].map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <Card className="border-border bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-colors">
                        <CardContent className="p-4 text-center">
                            <div className="inline-flex p-2.5 rounded-xl bg-primary/10 mb-2">
                                <stat.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    )
}

export default {
    CommunityStatsCard,
    CommunityGrowthCard,
    CommunityInfoCard,
    CommunityQuickStats
}
