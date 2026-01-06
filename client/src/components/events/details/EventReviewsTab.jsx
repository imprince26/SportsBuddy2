import { formatDistanceToNow } from "date-fns"
import { Star, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Star Rating Input Component
const StarRatingInput = ({ rating, setRating }) => {
    return (
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                >
                    <Star
                        className={cn(
                            "w-8 h-8 transition-colors",
                            star <= rating
                                ? "text-yellow-400 fill-current"
                                : "text-muted-foreground hover:text-yellow-400",
                        )}
                    />
                </button>
            ))}
        </div>
    )
}

// Review Form Component
const ReviewForm = ({
    rating,
    setRating,
    review,
    setReview,
    submittingReview,
    handleSubmitRating
}) => {
    return (
        <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="font-semibold text-foreground mb-4">
                Share Your Experience
            </h4>
            <form onSubmit={handleSubmitRating} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Rating
                    </label>
                    <StarRatingInput rating={rating} setRating={setRating} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Review (Optional)
                    </label>
                    <Textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Share your thoughts about this event..."
                        className="bg-card border-border"
                        rows={3}
                    />
                </div>
                <Button
                    type="submit"
                    disabled={rating === 0 || submittingReview}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    {submittingReview ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Star className="w-4 h-4 mr-2" />
                            Submit Review
                        </>
                    )}
                </Button>
            </form>
        </div>
    )
}

// Star Rating Display Component
const StarRatingDisplay = ({ rating }) => {
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={cn(
                        "w-4 h-4",
                        i < rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted-foreground/30",
                    )}
                />
            ))}
        </div>
    )
}

// Single Review Card Component
const ReviewCard = ({ rating, index }) => {
    return (
        <div
            className="p-5 bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl border border-border/50 hover:border-border transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                    <AvatarImage src={rating.user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-600 dark:text-blue-400 font-semibold">
                        {rating.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                            <h4 className="font-semibold text-foreground">
                                {rating.user.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <StarRatingDisplay rating={rating.rating} />
                                <span className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(rating.date || rating.createdAt))} ago
                                </span>
                            </div>
                        </div>
                    </div>
                    {rating.review && (
                        <p className="text-foreground/80 leading-relaxed mt-3 text-sm">
                            {rating.review}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

// Empty Reviews State
const EmptyReviews = ({ isEventEnded }) => {
    return (
        <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-yellow-500 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
                No Reviews Yet
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
                {isEventEnded ? "Be the first to share your experience!" : "Reviews will be available after the event ends."}
            </p>
        </div>
    )
}

// Average Rating Display Component
const AverageRatingDisplay = ({ ratings }) => {
    if (!ratings || ratings.length === 0) return null

    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0)
    const avgRating = totalRating / ratings.length

    return (
        <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            "w-4 h-4",
                            i < Math.floor(avgRating)
                                ? "text-yellow-400 fill-current"
                                : "text-muted-foreground",
                        )}
                    />
                ))}
            </div>
            <span className="font-semibold text-foreground">
                {avgRating.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
                ({ratings.length} {ratings.length === 1 ? 'review' : 'reviews'})
            </span>
        </div>
    )
}

// Main Reviews Tab Component
const EventReviewsTab = ({
    event,
    isAuthenticated,
    isParticipant,
    hasRated,
    isEventEnded,
    rating,
    setRating,
    review,
    setReview,
    submittingReview,
    handleSubmitRating
}) => {
    // Sort ratings by date (newest first)
    const sortedRatings = event.ratings ?
        [...event.ratings].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
        : []

    return (
        <div className="space-y-6 mt-0">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="bg-card border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-foreground">
                            Event Reviews
                            <AverageRatingDisplay ratings={event.ratings} />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Add Review Form */}
                        {isAuthenticated && isParticipant() && !hasRated && isEventEnded() && (
                            <ReviewForm
                                rating={rating}
                                setRating={setRating}
                                review={review}
                                setReview={setReview}
                                submittingReview={submittingReview}
                                handleSubmitRating={handleSubmitRating}
                            />
                        )}

                        {/* Reviews List */}
                        {sortedRatings.length > 0 ? (
                            <div className="space-y-4">
                                {sortedRatings.map((ratingItem, index) => (
                                    <ReviewCard
                                        key={ratingItem._id}
                                        rating={ratingItem}
                                        index={index}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyReviews isEventEnded={isEventEnded()} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default EventReviewsTab
