import {
    Loader2,
    Trash2,
    UserMinus,
    AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// Join Community Dialog (for private communities)
export const JoinCommunityDialog = ({
    open,
    onOpenChange,
    communityName,
    message,
    setMessage,
    onSubmit,
    isSubmitting
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle>Request to Join</DialogTitle>
                    <DialogDescription>
                        This is a private community. Send a message to the moderators explaining why you'd like to join <strong>{communityName}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <Textarea
                        placeholder="Why do you want to join this community? (optional)"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[100px] border-border"
                    />
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Send Request"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Leave Community Dialog
export const LeaveCommunityDialog = ({
    open,
    onOpenChange,
    communityName,
    onSubmit,
    isSubmitting
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
                        <UserMinus className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <DialogTitle className="text-center">Leave Community?</DialogTitle>
                    <DialogDescription className="text-center">
                        Are you sure you want to leave <strong>{communityName}</strong>? You'll need to rejoin if you change your mind.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0 pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Leaving...
                            </>
                        ) : (
                            "Leave Community"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Delete Community Dialog
export const DeleteCommunityDialog = ({
    open,
    onOpenChange,
    communityName,
    onSubmit,
    isSubmitting
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <DialogTitle className="text-center">Delete Community?</DialogTitle>
                    <DialogDescription className="text-center">
                        This action cannot be undone. <strong>{communityName}</strong> and all its posts will be permanently deleted.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0 pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Community
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Delete Post Dialog
export const DeletePostDialog = ({
    open,
    onOpenChange,
    onSubmit,
    isSubmitting
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                        <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <DialogTitle className="text-center">Delete Post?</DialogTitle>
                    <DialogDescription className="text-center">
                        This post will be permanently deleted. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0 pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete Post"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default {
    JoinCommunityDialog,
    LeaveCommunityDialog,
    DeleteCommunityDialog,
    DeletePostDialog
}
