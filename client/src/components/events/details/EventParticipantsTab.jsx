import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { Users, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Creator Card Component
const EventCreatorCard = ({ creator, createdAt }) => {
    return (
        <Link to={`/profile/${creator._id}`} className="block mb-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800/50">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar className="w-12 h-12 border-2 border-yellow-400">
                            <AvatarImage src={creator.avatar?.url} />
                            <AvatarFallback className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                                {creator.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Trophy className="w-3 h-3 text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">
                                {creator.name}
                            </h4>
                            <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700">
                                Event Creator
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Joined {formatDistanceToNow(new Date(createdAt))} ago
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    )
}

// Participant Card Component
const ParticipantCard = ({ participant, index }) => {
    return (
        <Link to={`/profile/${participant.user._id}`}>
            <div
                className="p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
            >
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={participant.user.avatar?.url} />
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            {participant.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                            {participant.user.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Joined {formatDistanceToNow(new Date(participant.joinedAt))} ago
                        </p>
                    </div>
                    {participant.teamName && (
                        <Badge variant="outline" className="text-xs">
                            {participant.teamName}
                        </Badge>
                    )}
                </div>
            </div>
        </Link>
    )
}

// Empty State
const EmptyParticipants = () => {
    return (
        <div className="text-center py-8">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
                No Participants Yet
            </h3>
            <p className="text-muted-foreground">
                Be the first to join this exciting event!
            </p>
        </div>
    )
}

// Main Participants Tab Component
const EventParticipantsTab = ({ event }) => {
    return (
        <div className="space-y-6 mt-0">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="bg-card border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-foreground">
                                Event Participants ({event.participantCount})
                            </div>
                            <Badge
                                variant="secondary"
                                className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            >
                                {event.maxParticipants - event.participantCount} spots left
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {event.participants.length > 0 ? (
                            <div className="space-y-4">
                                {/* Event Creator */}
                                <EventCreatorCard
                                    creator={event.createdBy}
                                    createdAt={event.createdAt}
                                />

                                {/* Participants Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {event.participants.map((participant, index) => (
                                        <ParticipantCard
                                            key={participant._id}
                                            participant={participant}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <EmptyParticipants />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default EventParticipantsTab
