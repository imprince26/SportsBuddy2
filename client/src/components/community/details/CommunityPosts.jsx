import { useState, useRef } from "react"
import {
    Plus,
    Image as ImageIcon,
    Video,
    Calendar,
    X,
    Loader2,
    Send
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

// Create Post Prompt Card - Using only primary brand colors
export const CreatePostPrompt = ({ user, onClick }) => {
    return (
        <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-border">
                        <AvatarImage src={user?.avatar?.url} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <Button
                        variant="outline"
                        className="flex-1 justify-start text-left text-muted-foreground h-10 rounded-full border-border hover:bg-muted hover:border-primary/30"
                        onClick={onClick}
                    >
                        What's on your mind, {user?.name?.split(' ')[0]}?
                    </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClick}
                        className="flex-1 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Photo
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClick}
                        className="flex-1 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                        <Video className="w-4 h-4 mr-2" />
                        Video
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClick}
                        className="flex-1 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                        <Calendar className="w-4 h-4 mr-2" />
                        Event
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// Create Post Dialog
export const CreatePostDialog = ({
    open,
    onOpenChange,
    user,
    content,
    setContent,
    images,
    onImageUpload,
    onRemoveImage,
    onSubmit,
    isSubmitting
}) => {
    const fileInputRef = useRef(null)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-center pb-4 border-b border-border">
                        Create Post
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-border">
                            <AvatarImage src={user?.avatar?.url} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-foreground">{user?.name}</p>
                            <p className="text-xs text-muted-foreground">Posting to community</p>
                        </div>
                    </div>

                    {/* Content Input */}
                    <Textarea
                        placeholder="What would you like to share?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[150px] text-base border-0 focus-visible:ring-0 resize-none bg-transparent p-0"
                    />

                    {/* Image Previews */}
                    {images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                            {images.map((img, index) => (
                                <div key={index} className="relative rounded-lg overflow-hidden aspect-video bg-muted">
                                    <img
                                        src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                                        alt={`Upload ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => onRemoveImage(index)}
                                        className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Media */}
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-border">
                        <span className="text-sm text-muted-foreground flex-1">Add to your post</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={onImageUpload}
                            className="hidden"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                            <ImageIcon className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                        >
                            <Video className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={onSubmit}
                        disabled={isSubmitting || (!content.trim() && images.length === 0)}
                        className="w-full bg-primary hover:bg-primary/90"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Posting...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Post
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Edit Post Dialog
export const EditPostDialog = ({
    open,
    onOpenChange,
    post,
    content,
    setContent,
    images,
    onImageUpload,
    onRemoveImage,
    onSubmit,
    isSubmitting
}) => {
    const fileInputRef = useRef(null)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-center pb-4 border-b border-border">
                        Edit Post
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Content Input */}
                    <Textarea
                        placeholder="What would you like to share?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[150px] text-base border-border focus-visible:ring-primary resize-none"
                    />

                    {/* Existing Images */}
                    {post?.images?.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                            {post.images.map((img, index) => (
                                <div key={index} className="relative rounded-lg overflow-hidden aspect-video bg-muted">
                                    <img
                                        src={img.url || img}
                                        alt={`Image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* New Image Previews */}
                    {images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                            {images.map((img, index) => (
                                <div key={index} className="relative rounded-lg overflow-hidden aspect-video bg-muted">
                                    <img
                                        src={URL.createObjectURL(img)}
                                        alt={`New Upload ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => onRemoveImage(index)}
                                        className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Media */}
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-border">
                        <span className="text-sm text-muted-foreground flex-1">Add new images</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={onImageUpload}
                            className="hidden"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                            <ImageIcon className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={isSubmitting || (!content.trim() && images.length === 0 && !post?.images?.length)}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default {
    CreatePostPrompt,
    CreatePostDialog,
    EditPostDialog
}
