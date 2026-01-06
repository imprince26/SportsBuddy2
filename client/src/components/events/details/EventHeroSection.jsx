import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    Star,
    ChevronLeft,
    Share2,
    Heart,
    ArrowLeft,
    ArrowRight,
    MoreVertical,
    Copy,
    Eye,
    UserPlus,
    Loader2,
    CheckCircle,
    Trophy,
    Activity,
    Bike,
    Waves
} from "lucide-react"
import { FaMoneyBillWave } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Helper functions
export const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
        case "Beginner":
            return "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
        case "Intermediate":
            return "bg-yellow-50 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
        case "Advanced":
            return "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
        default:
            return "bg-gray-50 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800"
    }
}

export const getCategoryIcon = (category) => {
    const icons = {
        Football: Trophy,
        Basketball: Trophy,
        Tennis: Trophy,
        Running: Activity,
        Cycling: Bike,
        Swimming: Waves,
        Volleyball: Trophy,
        Cricket: Trophy,
        default: Trophy,
    }
    return icons[category] || icons.default
}

const EventHeroSection = ({
    event,
    isAuthenticated,
    isParticipant,
    isCreator,
    loadingAction,
    isFavorite,
    activeImageIndex,
    setActiveImageIndex,
    setShowImageModal,
    setShowShareModal,
    handleJoinEvent,
    handleShare,
    handlePreviousPage,
    toggleFavorite,
    setActiveTab
}) => {
    const navigate = useNavigate()

    return (
        <div className="relative overflow-hidden border-b border-border bg-background/50 backdrop-blur-sm">
            <div className="relative container mx-auto px-4 py-8 sm:py-12 lg:py-16">
                {/* Breadcrumb */}
                <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Button
                        onClick={handlePreviousPage}
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground hover:bg-accent border border-border rounded-xl"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Events
                    </Button>
                </div>

                {/* Hero Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center animate-in fade-in duration-700">
                    {/* Left Content */}
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                        {/* Category Badge */}
                        <div className="inline-block animate-in zoom-in-90 fade-in duration-600 delay-200">
                            <div className="group relative">
                                <div className="relative px-4 sm:px-6 py-2 sm:py-3 bg-card rounded-full border border-border flex items-center gap-2 sm:gap-3 shadow-sm">
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                        {(() => {
                                            const IconComponent = getCategoryIcon(event.category);
                                            return <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />;
                                        })()}
                                    </div>
                                    <span className="text-foreground font-medium text-sm sm:text-base">{event.category}</span>
                                    {event.difficulty && (
                                        <span className="text-white font-medium text-xs">
                                            <span className={cn("px-2 py-1 rounded-full", getDifficultyColor(event.difficulty))}>
                                                {event.difficulty}
                                            </span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
                                {event.name}
                            </h1>
                            <div className="flex items-center gap-3 text-muted-foreground mb-6">
                                <MapPin className="w-5 h-5 flex-shrink-0" />
                                <span className="text-lg">
                                    {event.location.address}, {event.location.city}
                                </span>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <EventQuickStats event={event} />

                        {/* Action Buttons */}
                        <EventActionButtons
                            event={event}
                            isAuthenticated={isAuthenticated}
                            isParticipant={isParticipant}
                            isCreator={isCreator}
                            loadingAction={loadingAction}
                            handleJoinEvent={handleJoinEvent}
                            setShowShareModal={setShowShareModal}
                            setActiveTab={setActiveTab}
                        />
                    </div>

                    {/* Right Content - Hero Image */}
                    <EventHeroImage
                        event={event}
                        activeImageIndex={activeImageIndex}
                        setActiveImageIndex={setActiveImageIndex}
                        setShowImageModal={setShowImageModal}
                        isFavorite={isFavorite}
                        toggleFavorite={toggleFavorite}
                        handleShare={handleShare}
                    />
                </div>
            </div>
        </div>
    )
}

// Quick Stats Component
const EventQuickStats = ({ event }) => {
    const stats = [
        {
            label: "Participants",
            value: `${event.participantCount}/${event.maxParticipants}`,
            icon: Users,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-900/20",
        },
        {
            label: "Date",
            value: format(new Date(event.date), "MMM dd"),
            icon: Calendar,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-50 dark:bg-green-900/20",
        },
        {
            label: "Time",
            value: event.time,
            icon: Clock,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-900/20",
        },
        {
            label: event.registrationFee > 0 ? "Fee" : "Rating",
            value:
                event.registrationFee > 0
                    ? `₹${event.registrationFee}`
                    : event.averageRating > 0
                        ? event.averageRating.toFixed(1)
                        : "N/A",
            icon: event.registrationFee > 0 ? FaMoneyBillWave : Star,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-50 dark:bg-green-900/20",
        },
    ]

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            {stats.map((stat, index) => (
                <div key={index} className="group relative">
                    <div className="relative p-3 sm:p-4 bg-card rounded-xl border border-border text-center hover:border-primary/50 transition-colors">
                        <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-xl ${stat.bg} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
                        >
                            <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-foreground mb-1">{stat.value}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// Action Buttons Component
const EventActionButtons = ({
    event,
    isAuthenticated,
    isParticipant,
    isCreator,
    loadingAction,
    handleJoinEvent,
    setShowShareModal,
    setActiveTab
}) => {
    return (
        <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            {/* Join button - only show for upcoming events, non-participants, non-creators */}
            {isAuthenticated && !isParticipant() && !isCreator() && event.status === "Upcoming" && new Date(event.date) > new Date() && (
                <div className="transition-transform hover:scale-105 active:scale-95">
                    <Button
                        onClick={handleJoinEvent}
                        disabled={loadingAction || event.participantCount >= event.maxParticipants}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6 py-3 rounded-xl shadow-lg"
                        size="lg"
                    >
                        {loadingAction ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <UserPlus className="w-5 h-5 mr-2" />
                        )}
                        {event.participantCount >= event.maxParticipants ? "Event Full" : "Join Event"}
                    </Button>
                </div>
            )}

            {/* View Details button for participants */}
            {isAuthenticated && isParticipant() && !isCreator() && (
                <div className="transition-transform hover:scale-105 active:scale-95">
                    <Button
                        onClick={() => setActiveTab("participants")}
                        className="bg-green-600 text-white hover:bg-green-700 font-bold px-6 py-3 rounded-xl shadow-lg"
                        size="lg"
                    >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Joined - View Details
                    </Button>
                </div>
            )}

            {!isAuthenticated && event.status === "Upcoming" && new Date(event.date) > new Date() && (
                <div className="transition-transform hover:scale-105 active:scale-95">
                    <Button
                        asChild
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6 py-3 rounded-xl shadow-lg"
                    >
                        <Link to="/login">
                            <UserPlus className="w-5 h-5 mr-2" />
                            Login to Join
                        </Link>
                    </Button>
                </div>
            )}

            <div className="transition-transform hover:scale-105 active:scale-95">
                <Button
                    variant="outline"
                    onClick={() => setShowShareModal(true)}
                    className="bg-card border-border text-foreground hover:bg-accent px-6 py-3 rounded-xl"
                >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share Event
                </Button>
            </div>
        </div>
    )
}

// Hero Image Component
const EventHeroImage = ({
    event,
    activeImageIndex,
    setActiveImageIndex,
    setShowImageModal,
    isFavorite,
    toggleFavorite,
    handleShare
}) => {
    return (
        <div className="relative animate-in slide-in-from-right-8 fade-in duration-500 delay-200">
            <div className="relative group">
                <div className="relative aspect-video rounded-3xl overflow-hidden border border-border bg-muted">
                    {event.images && event.images.length > 0 ? (
                        <img
                            src={event.images[activeImageIndex].url || "/placeholder.svg"}
                            alt={event.name}
                            className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
                            onClick={() => setShowImageModal(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Calendar className="w-24 h-24 text-muted-foreground" />
                        </div>
                    )}

                    {/* Image Navigation */}
                    {event.images && event.images.length > 1 && (
                        <>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100 bg-black/50 hover:bg-black/70 backdrop-blur-sm border-0 text-white transition-all duration-300 rounded-full"
                                onClick={() =>
                                    setActiveImageIndex((prev) => (prev === 0 ? event.images.length - 1 : prev - 1))
                                }
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100 bg-black/50 hover:bg-black/70 backdrop-blur-sm border-0 text-white transition-all duration-300 rounded-full"
                                onClick={() =>
                                    setActiveImageIndex((prev) => (prev === event.images.length - 1 ? 0 : prev + 1))
                                }
                            >
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </>
                    )}

                    {/* Action Buttons Overlay */}
                    <div className="absolute top-4 right-4 flex gap-2 transition-opacity duration-300">
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={toggleFavorite}
                            className={cn(
                                "bg-black/50 hover:bg-black/70 backdrop-blur-sm border-0 text-white rounded-full",
                                isFavorite && "text-red-400",
                            )}
                        >
                            <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="bg-black/50 hover:bg-black/70 backdrop-blur-sm border-0 text-white rounded-full"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                                <DropdownMenuItem onClick={() => handleShare("copy")}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Link
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowImageModal(true)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Gallery
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Image Indicators */}
                    {event.images && event.images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                            {event.images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImageIndex(index)}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all duration-300",
                                        index === activeImageIndex ? "bg-white w-6" : "bg-white/50",
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EventHeroSection
