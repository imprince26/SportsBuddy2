import { useRef } from "react"
import { format as formatDate, isToday, isYesterday, isSameDay } from 'date-fns'
import {
    MessageSquare,
    Send,
    Smile,
    Paperclip,
    ImageIcon
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import EmojiPicker from 'emoji-picker-react'
import { cn } from "@/lib/utils"

// Helper functions
export const groupMessagesByDate = (messages) => {
    const groups = []
    let currentGroup = null

    messages.forEach((msg) => {
        const msgDate = new Date(msg.timestamp)

        if (!currentGroup || !isSameDay(new Date(currentGroup.date), msgDate)) {
            currentGroup = {
                date: msgDate,
                messages: [msg]
            }
            groups.push(currentGroup)
        } else {
            currentGroup.messages.push(msg)
        }
    })

    return groups
}

export const getDateLabel = (date) => {
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return formatDate(date, 'MMM dd, yyyy')
}

// Date Separator Component
const DateSeparator = ({ date }) => {
    return (
        <div className="flex items-center justify-center my-6">
            <div className="px-2 py-1 bg-muted rounded-full">
                <span className="text-xs font-medium text-muted-foreground">
                    {getDateLabel(date)}
                </span>
            </div>
        </div>
    )
}

// Message Bubble Component
const MessageBubble = ({ msg, user, index, showAvatar, isLastInGroup }) => {
    const isOwn = msg.user._id === user?.id

    return (
        <div
            className={cn(
                "flex gap-3 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-300",
                isOwn ? "flex-row-reverse" : "flex-row",
                !showAvatar && "ml-11"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* Avatar */}
            {!isOwn && showAvatar ? (
                <Avatar className="w-8 h-8 ring-2 ring-border shadow-sm">
                    <AvatarImage src={msg.user?.avatar?.url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {msg.user.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            ) : !isOwn ? (
                <div className="w-8 h-8" />
            ) : null}

            <div className={cn(
                "flex flex-col max-w-[70%] sm:max-w-[80%]",
                isOwn ? "items-end" : "items-start"
            )}>
                {/* Username (only show for first message in group) */}
                {!isOwn && showAvatar && (
                    <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-xs font-semibold text-foreground">
                            {msg.user.name}
                        </span>
                        {msg.user.role === 'admin' && (
                            <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-[8px] text-white font-bold">A</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Message Bubble */}
                <div
                    className={cn(
                        "relative px-4 py-2 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md group",
                        isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border",
                        // Rounded corners based on position
                        isOwn
                            ? showAvatar ? "rounded-tr-md" : isLastInGroup ? "rounded-br-md" : "rounded-r-md"
                            : showAvatar ? "rounded-tl-md" : isLastInGroup ? "rounded-bl-md" : "rounded-l-md"
                    )}
                >
                    {/* Message Content */}
                    <div className={cn(
                        "text-sm md:text-[1rem] leading-relaxed break-words",
                        !isOwn && "text-card-foreground"
                    )}>
                        {msg.message}
                    </div>

                    {/* Message Time - only show on last message in group */}
                    {isLastInGroup && (
                        <div className={cn(
                            "flex items-center gap-1 mt-1",
                            isOwn ? "justify-end" : "justify-start"
                        )}>
                            <span className={cn(
                                "text-xs opacity-70",
                                isOwn ? "text-white/80" : "text-muted-foreground"
                            )}>
                                {formatDate(new Date(msg.timestamp), 'HH:mm')}
                            </span>
                            {isOwn && (
                                <div className="flex gap-0.5">
                                    <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                                    <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Empty Chat State
const EmptyChatState = () => {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
                Start the conversation
            </h3>
            <p className="text-muted-foreground max-w-sm">
                Be the first to send a message and break the ice with other participants!
            </p>
        </div>
    )
}

// Chat Input Component
const ChatInput = ({
    message,
    setMessage,
    sendingMessage,
    showEmojiPicker,
    setShowEmojiPicker,
    handleSendMessage,
    handleFileUpload,
    handleFileChange,
    onEmojiClick,
    fileInputRef
}) => {
    return (
        <div className="p-4 sm:p-6 border-t border-border bg-muted/50">
            <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                {/* Additional Actions */}
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={handleFileUpload}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                        title="Upload file"
                    >
                        <Paperclip className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

                    <button
                        type="button"
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                        title="Send image"
                    >
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Message Input Container */}
                <div className="flex-1 relative">
                    <div className="flex items-end bg-card rounded-2xl border border-border shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 border-0 bg-transparent focus:ring-0 focus-visible:ring-0 text-sm px-4 py-3 max-h-32 resize-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSendMessage(e)
                                }
                            }}
                        />

                        {/* Emoji Button */}
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-2 mr-2 rounded-full hover:bg-muted transition-colors"
                            title="Add emoji"
                        >
                            <Smile className={cn(
                                "w-5 h-5 transition-colors",
                                showEmojiPicker
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-primary"
                            )} />
                        </button>
                    </div>
                </div>

                {/* Send Button */}
                <Button
                    type="submit"
                    disabled={!message.trim() || sendingMessage}
                    size="icon"
                    className="h-12 w-12 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {sendingMessage ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </Button>
            </form>
        </div>
    )
}

// Main Chat Modal Component
const EventChatModal = ({
    event,
    user,
    showChatModal,
    setShowChatModal,
    message,
    setMessage,
    sendingMessage,
    showEmojiPicker,
    setShowEmojiPicker,
    handleSendMessage,
    onEmojiClick,
    chatEndRef
}) => {
    const fileInputRef = useRef(null)

    const handleFileUpload = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e) => {
        // Reset the input
        e.target.value = null
    }

    return (
        <>
            <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
                <DialogContent className="max-w-5xl h-[90vh] bg-gray-50 dark:bg-card/10 backdrop-blur-3xl border-border p-0 overflow-auto scrollbar-hide">
                    <DialogHeader className="px-4 md:mt-3 mt-6 sm:p-6 pb-0 border-b border-border">
                        <DialogTitle className="flex items-center gap-3 text-foreground">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold truncate">Event Chat</h3>
                                <p className="text-sm text-muted-foreground truncate">{event.name}</p>
                            </div>
                            <Badge
                                variant="secondary"
                                className="px-2 py-1 md:flex hidden"
                            >
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                Participants Only
                            </Badge>
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground mt-2">
                            Chat with other event participants in real-time • {event.participantCount} members
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col h-full overflow-hidden">
                        {/* Chat Messages */}
                        <ScrollArea className="flex-1 px-8 sm:px-6">
                            <div className="py-4 space-y-6">
                                {event.chat && event.chat.length > 0 ? (
                                    groupMessagesByDate(event.chat).map((group, groupIndex) => (
                                        <div key={groupIndex} className="space-y-4">
                                            {/* Date Separator */}
                                            <DateSeparator date={group.date} />

                                            {/* Messages for this date */}
                                            {group.messages.map((msg, msgIndex) => {
                                                const showAvatar = msgIndex === 0 || group.messages[msgIndex - 1].user._id !== msg.user._id
                                                const isLastInGroup = msgIndex === group.messages.length - 1 ||
                                                    group.messages[msgIndex + 1].user._id !== msg.user._id

                                                return (
                                                    <MessageBubble
                                                        key={msg._id}
                                                        msg={msg}
                                                        user={user}
                                                        index={msgIndex}
                                                        showAvatar={showAvatar}
                                                        isLastInGroup={isLastInGroup}
                                                    />
                                                )
                                            })}
                                        </div>
                                    ))
                                ) : (
                                    <EmptyChatState />
                                )}
                                <div ref={chatEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                            <div className="absolute bottom-20 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <EmojiPicker
                                    onEmojiClick={onEmojiClick}
                                    theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                                    width={350}
                                    height={400}
                                    previewConfig={{
                                        showPreview: false
                                    }}
                                    skinTonesDisabled
                                    searchDisabled={false}
                                />
                            </div>
                        )}

                        {/* Message Input */}
                        <ChatInput
                            message={message}
                            setMessage={setMessage}
                            sendingMessage={sendingMessage}
                            showEmojiPicker={showEmojiPicker}
                            setShowEmojiPicker={setShowEmojiPicker}
                            handleSendMessage={handleSendMessage}
                            handleFileUpload={handleFileUpload}
                            handleFileChange={handleFileChange}
                            onEmojiClick={onEmojiClick}
                            fileInputRef={fileInputRef}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Emoji Picker Overlay to close when clicking outside */}
            {showEmojiPicker && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowEmojiPicker(false)}
                />
            )}
        </>
    )
}

export default EventChatModal
