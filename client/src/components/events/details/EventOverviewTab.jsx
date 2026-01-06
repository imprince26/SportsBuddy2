import { format } from "date-fns"
import {
    Calendar,
    Clock,
    MapPin,
    Target,
    Eye,
    Navigation
} from "lucide-react"
import { FaMoneyBillWave, FaTools } from "react-icons/fa"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { getDifficultyColor } from "./EventHeroSection"

// About Section
export const EventAboutSection = ({ event }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                        About This Event
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-line text-muted-foreground leading-relaxed text-base sm:text-lg">
                        {event.description}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

// Event Information Card
export const EventInfoCard = ({ event }) => {
    return (
        <Card className="bg-card border-border shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                    Event Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-muted-foreground">Date</span>
                    </div>
                    <span className="text-foreground font-semibold">
                        {format(new Date(event.date), "MMMM dd, yyyy")}
                    </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className="font-medium text-muted-foreground">Time</span>
                    </div>
                    <span className="text-foreground font-semibold">{event.time}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <span className="font-medium text-muted-foreground">Difficulty</span>
                    </div>
                    <Badge className={cn("border font-medium", getDifficultyColor(event.difficulty))}>
                        {event.difficulty}
                    </Badge>
                </div>

                {event.registrationFee > 0 && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <FaMoneyBillWave className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span className="font-medium text-muted-foreground">
                                Registration Fee
                            </span>
                        </div>
                        <span className="text-foreground font-semibold text-lg">
                            ₹{event.registrationFee}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// Participation Card
export const EventParticipationCard = ({ event }) => {
    return (
        <Card className="bg-card border-border shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                    Participation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">
                        {event.participantCount}
                        <span className="text-muted-foreground">/{event.maxParticipants}</span>
                    </div>
                    <p className="text-muted-foreground">Participants Joined</p>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Event Capacity</span>
                        <span className="font-medium text-foreground">
                            {Math.round((event.participantCount / event.maxParticipants) * 100)}% filled
                        </span>
                    </div>
                    <Progress
                        value={(event.participantCount / event.maxParticipants) * 100}
                        className="h-3 bg-muted"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {event.maxParticipants - event.participantCount}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">Spots Left</div>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {Math.max(
                                0,
                                Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24)),
                            )}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">Days Left</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Rules Card
export const EventRulesCard = ({ rules }) => {
    if (!rules || rules.length === 0) return null

    return (
        <Card className="bg-card border-border shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                    Event Rules
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {rules.map((ruleItem, index) => (
                        <li
                            key={index}
                            className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg animate-in fade-in slide-in-from-left-4 duration-500"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-red-600 dark:text-red-400 text-sm font-semibold">
                                    {index + 1}
                                </span>
                            </div>
                            <span className="text-muted-foreground leading-relaxed">
                                {typeof ruleItem === "object"
                                    ? ruleItem.rule || ruleItem.text || "Rule"
                                    : ruleItem}
                            </span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}

// Equipment Card
export const EventEquipmentCard = ({ equipment }) => {
    if (!equipment || equipment.length === 0) return null

    return (
        <Card className="bg-card border-border shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                    Required Equipment
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {equipment.map((equipmentItem, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg animate-in fade-in zoom-in-90 duration-500"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                <FaTools className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span className="text-muted-foreground font-medium">
                                {typeof equipmentItem === "object"
                                    ? equipmentItem.item || equipmentItem.name || "Equipment Item"
                                    : equipmentItem}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

// Location Card
export const EventLocationCard = ({ location, setShowLocationModal }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                        Event Location
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-foreground mb-1">
                                    {location.venue || "Event Venue"}
                                </h4>
                                <p className="text-muted-foreground">{location.address}</p>
                                <p className="text-muted-foreground">
                                    {location.city}, {location.state} {location.zipCode}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowLocationModal(true)}
                            className="flex-1 bg-card border-border"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            View on Map
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                const address = `${location.address}, ${location.city}, ${location.state}`
                                window.open(`https://maps.google.com/maps?q=${encodeURIComponent(address)}`, "_blank")
                            }}
                            className="flex-1 bg-card border-border"
                        >
                            <Navigation className="w-4 h-4 mr-2" />
                            Get Directions
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Combined Overview Tab Content
const EventOverviewTab = ({ event, setShowLocationModal }) => {
    return (
        <div className="space-y-6 mt-0">
            {/* About Section */}
            <EventAboutSection event={event} />

            {/* Event Details Grid */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EventInfoCard event={event} />
                    <EventParticipationCard event={event} />
                </div>
            </div>

            {/* Rules and Equipment */}
            {(event.rules?.length > 0 || event.equipment?.length > 0) && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <EventRulesCard rules={event.rules} />
                        <EventEquipmentCard equipment={event.equipment} />
                    </div>
                </div>
            )}

            {/* Location Map */}
            <EventLocationCard
                location={event.location}
                setShowLocationModal={setShowLocationModal}
            />
        </div>
    )
}

export default EventOverviewTab
