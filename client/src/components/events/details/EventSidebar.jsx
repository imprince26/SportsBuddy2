import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import {
    Edit,
    Trash2,
    UserMinus,
    Loader2,
    Heart,
    Share2,
    Flag,
    CheckCircle,
    Eye,
    MessageCircle,
    Sparkles
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// Quick Actions Card
export const EventQuickActions = ({
    event,
    id,
    isAuthenticated,
    isParticipant,
    isCreator,
    loadingAction,
    isFavorite,
    handleLeaveEvent,
    toggleFavorite,
    setShowShareModal,
    setShowReportModal,
    setShowConfirmDelete
}) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                        Quick Actions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isAuthenticated && isParticipant() && !isCreator() && (
                        <Button
                            onClick={handleLeaveEvent}
                            disabled={loadingAction}
                            variant="outline"
                            className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent rounded-[.4rem]"
                        >
                            {loadingAction ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <UserMinus className="w-4 h-4 mr-2" />
                            )}
                            Leave Event
                        </Button>
                    )}

                    {isAuthenticated && isCreator() && (
                        <>
                            <Button
                                asChild
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-[.4rem]"
                            >
                                <Link to={`/events/${id}/edit`}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Event
                                </Link>
                            </Button>
                            <Button
                                onClick={() => setShowConfirmDelete(true)}
                                disabled={loadingAction}
                                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-[.4rem]"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Event
                            </Button>
                        </>
                    )}

                    <Button
                        onClick={toggleFavorite}
                        className={cn(
                            "w-full rounded-[.4rem]",
                            isFavorite
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "bg-muted text-foreground hover:bg-accent",
                        )}
                    >
                        <Heart className={cn("w-4 h-4 mr-2", isFavorite && "fill-current")} />
                        {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    </Button>

                    <Button
                        onClick={() => setShowShareModal(true)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-[.4rem]"
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Event
                    </Button>

                    <Button
                        onClick={() => setShowReportModal(true)}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded-[.4rem]"
                    >
                        <Flag className="w-4 h-4 mr-2" />
                        Report Event
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

// Event Organizer Card
export const EventOrganizerCard = ({ creator, navigate }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                        Event Organizer
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="w-16 h-16 border-2 border-green-400">
                                <AvatarImage src={creator.avatar?.url} />
                                <AvatarFallback className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-lg">
                                    {creator.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-foreground text-lg">{creator.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">Event Organizer</p>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="flex-1 bg-transparent border-border">
                                    <MessageCircle className="w-4 h-4 mr-1" />
                                    Message
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => navigate(`/profile/${creator._id}`)}
                                    variant="outline"
                                    className="bg-transparent border-border"
                                >
                                    <Eye className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Event Statistics Card
export const EventStatsCard = ({ event }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                        Event Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{event.views || 0}</div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">Views</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {event.shares || 0}
                            </div>
                            <div className="text-xs text-purple-600 dark:text-purple-400">Shares</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {event.ratings?.length || 0}
                            </div>
                            <div className="text-xs text-orange-600 dark:text-orange-400">Reviews</div>
                        </div>
                    </div>

                    <Separator className="bg-border" />

                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Created</span>
                            <span className="font-medium text-foreground">
                                {formatDistanceToNow(new Date(event.createdAt))} ago
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Last Updated</span>
                            <span className="font-medium text-foreground">
                                {formatDistanceToNow(new Date(event.updatedAt))} ago
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Similar Events Card
export const SimilarEventsCard = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
            <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                        Similar Events
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="text-center py-4">
                            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Similar events will appear here</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Combined Sidebar Component
const EventSidebar = ({
    event,
    id,
    isAuthenticated,
    isParticipant,
    isCreator,
    loadingAction,
    isFavorite,
    handleLeaveEvent,
    toggleFavorite,
    setShowShareModal,
    setShowReportModal,
    setShowConfirmDelete,
    navigate
}) => {
    return (
        <div className="space-y-6">
            <EventQuickActions
                event={event}
                id={id}
                isAuthenticated={isAuthenticated}
                isParticipant={isParticipant}
                isCreator={isCreator}
                loadingAction={loadingAction}
                isFavorite={isFavorite}
                handleLeaveEvent={handleLeaveEvent}
                toggleFavorite={toggleFavorite}
                setShowShareModal={setShowShareModal}
                setShowReportModal={setShowReportModal}
                setShowConfirmDelete={setShowConfirmDelete}
            />
            <EventOrganizerCard creator={event.createdBy} navigate={navigate} />
            <EventStatsCard event={event} />
            <SimilarEventsCard />
        </div>
    )
}

export default EventSidebar
