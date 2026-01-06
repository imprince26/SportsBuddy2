import { format } from "date-fns"
import {
    Calendar,
    Users,
    Eye,
    ArrowLeft,
    ArrowRight,
    Trash2,
    Loader2,
    AlertTriangle,
    Share2,
    Copy
} from "lucide-react"
import { FaWhatsapp, FaFacebook } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Delete Confirmation Modal
export const DeleteConfirmModal = ({
    showConfirmDelete,
    setShowConfirmDelete,
    loadingAction,
    handleDeleteEvent
}) => {
    return (
        <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
            <DialogContent className="bg-card/95 backdrop-blur-xl border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-6 h-6" />
                        Delete Event
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this event? This action cannot be undone and all participants will be
                        notified.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setShowConfirmDelete(false)} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteEvent}
                        disabled={loadingAction}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                        {loadingAction ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Delete Event
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// Share Modal
export const ShareModal = ({
    event,
    showShareModal,
    setShowShareModal,
    handleShare
}) => {
    return (
        <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
            <DialogContent className="sm:max-w-md bg-card/30 backdrop-blur-xl border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                            <Share2 className="w-5 h-5 text-primary" />
                        </div>
                        <span>Share Event</span>
                    </DialogTitle>
                    <DialogDescription>
                        Share this amazing event with your friends and community
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                    {/* Event Preview Card */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="flex gap-3">
                            {event.images && event.images[0] && (
                                <img
                                    src={event.images[0].url}
                                    alt={event.name}
                                    className="w-16 h-16 rounded-lg object-cover"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm line-clamp-1">{event.name}</h4>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Share Options Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            onClick={() => handleShare("copy")}
                            variant="secondary"
                            className="flex flex-col items-center gap-3 h-24 transition-all"
                        >
                            <div className="p-2 rounded-full bg-primary/10">
                                <Copy className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-sm font-medium">Copy Link</span>
                        </Button>
                        <Button
                            onClick={() => handleShare("whatsapp")}
                            variant="secondary"
                            className="flex flex-col items-center gap-3 h-24 transition-all"
                        >
                            <div className="p-2 rounded-full bg-green-500">
                                <FaWhatsapp className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium">WhatsApp</span>
                        </Button>
                        <Button
                            onClick={() => handleShare("facebook")}
                            variant="secondary"
                            className="flex flex-col items-center gap-3 h-24 transition-all"
                        >
                            <div className="p-2 rounded-full bg-blue-600">
                                <FaFacebook className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium">Facebook</span>
                        </Button>
                        <Button
                            onClick={() => handleShare("twitter")}
                            variant="secondary"
                            className="flex flex-col items-center gap-3 h-24 transition-all"
                        >
                            <div className="p-2 rounded-full bg-black">
                                <FaXTwitter className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium">X (Twitter)</span>
                        </Button>
                    </div>

                    {/* URL Display */}
                    <div className="p-3 rounded-lg bg-muted border border-border">
                        <p className="text-xs text-muted-foreground break-all font-mono">
                            {window.location.href}
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center justify-center gap-6 pt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{event.analytics?.views || 0} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{event.participants?.length || 0} joined</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// Image Gallery Modal
export const ImageGalleryModal = ({
    event,
    showImageModal,
    setShowImageModal,
    activeImageIndex,
    setActiveImageIndex
}) => {
    return (
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
            <DialogContent className="max-w-4xl bg-black/95 border-0 p-2 ">
                <div className="relative">
                    {event.images && event.images[activeImageIndex] && (
                        <img
                            src={event.images[activeImageIndex].url || "/placeholder.svg"}
                            alt={event.name}
                            className="w-full h-auto max-h-[80vh] object-contain"
                        />
                    )}
                    {event.images && event.images.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setActiveImageIndex((prev) => (prev === 0 ? event.images.length - 1 : prev - 1))}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setActiveImageIndex((prev) => (prev === event.images.length - 1 ? 0 : prev + 1))}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                            >
                                <ArrowRight className="w-6 h-6" />
                            </Button>
                        </>
                    )}
                    {event.images && event.images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                            {event.images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImageIndex(index)}
                                    className={cn(
                                        "w-3 h-3 rounded-full transition-all",
                                        index === activeImageIndex ? "bg-white" : "bg-white/50",
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default {
    DeleteConfirmModal,
    ShareModal,
    ImageGalleryModal
}
