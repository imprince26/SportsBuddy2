import { Users, Lock, MessageSquare } from "lucide-react"
import { Card } from "@/components/ui/card"

// Empty State Component
export const CommunityEmptyState = ({
    type = "discover", // discover | my-communities | search
    onAction,
    actionLabel
}) => {
    const content = {
        discover: {
            icon: Users,
            title: "No Communities Found",
            description: "We couldn't find any communities matching your criteria. Try adjusting your filters or create your own!",
            actionText: actionLabel || "Clear Filters"
        },
        "my-communities": {
            icon: Users,
            title: "No Communities Yet",
            description: "You haven't joined any communities yet. Discover and join communities to connect with other athletes!",
            actionText: actionLabel || "Discover Communities"
        },
        search: {
            icon: Users,
            title: "No Results",
            description: "No communities match your search. Try different keywords or browse all communities.",
            actionText: actionLabel || "Clear Search"
        },
        "sign-in": {
            icon: Lock,
            title: "Sign In Required",
            description: "Sign in to view your communities and manage your memberships.",
            actionText: actionLabel || "Sign In"
        }
    }

    const { icon: Icon, title, description, actionText } = content[type] || content.discover

    return (
        <Card className="text-center py-16 px-8 bg-card/50 border-dashed border-2 border-border">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <Icon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
            {onAction && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                    {actionText}
                </button>
            )}
        </Card>
    )
}

// Quick Stats Cards
export const CommunityQuickStats = ({ stats }) => {
    const statItems = [
        {
            label: "Total Communities",
            value: stats?.totalCommunities || 0,
            icon: Users,
            color: "text-primary",
            bgColor: "bg-primary/10"
        },
        {
            label: "Active Members",
            value: stats?.totalMembers || "5k+",
            icon: Users,
            color: "text-green-500",
            bgColor: "bg-green-500/10"
        },
        {
            label: "Posts Today",
            value: stats?.postsToday || 0,
            icon: MessageSquare,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10"
        },
        {
            label: "New This Week",
            value: stats?.newCommunities || 0,
            icon: Users,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10"
        }
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statItems.map((stat, i) => (
                <Card
                    key={i}
                    className="p-5 bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors"
                >
                    <div className={`p-2.5 rounded-xl ${stat.bgColor} w-fit mb-3`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
            ))}
        </div>
    )
}

// Trending Topics Component
export const TrendingTopics = ({ topics = [] }) => {
    const defaultTopics = [
        { name: "Football", count: 24 },
        { name: "Basketball", count: 18 },
        { name: "Running", count: 15 },
        { name: "Tennis", count: 12 },
        { name: "Cycling", count: 10 }
    ]

    const displayTopics = topics.length > 0 ? topics : defaultTopics

    return (
        <Card className="p-5 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Trending Sports</h3>
            <div className="flex flex-wrap gap-2">
                {displayTopics.map((topic, i) => (
                    <button
                        key={i}
                        className="px-4 py-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-sm font-medium"
                    >
                        {topic.name}
                        <span className="ml-2 text-xs text-muted-foreground">({topic.count})</span>
                    </button>
                ))}
            </div>
        </Card>
    )
}

export default {
    CommunityEmptyState,
    CommunityQuickStats,
    TrendingTopics
}
