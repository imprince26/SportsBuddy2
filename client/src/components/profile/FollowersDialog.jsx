import React from 'react'
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "react-hot-toast"
import {
  Users,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from '../ui/scroll-area'

const FollowersDialog = ({ isOpen, onClose, type, userId }) => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const { getUserFollowers, getUserFollowing, followUser, unfollowUser, user } = useAuth()

    useEffect(() => {
        if (isOpen && userId) {
            fetchUsers()
        }
    }, [isOpen, userId])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const data = type === "followers" ? await getUserFollowers(userId) : await getUserFollowing(userId)
            setUsers(data || [])
        } catch (error) {
            toast.error(`Failed to load ${type}`)
        } finally {
            setLoading(false)
        }
    }

    const handleFollow = async (targetUserId) => {
        try {
            await followUser(targetUserId)
            setUsers((prev) =>
                prev.map((u) => (u._id === targetUserId ? { ...u, isFollowedByCurrentUser: true } : u))
            )
        } catch (error) {
            toast.error("Failed to follow user")
        }
    }

    const handleUnfollow = async (targetUserId) => {
        try {
            await unfollowUser(targetUserId)
            setUsers((prev) =>
                prev.map((u) => (u._id === targetUserId ? { ...u, isFollowedByCurrentUser: false } : u))
            )
        } catch (error) {
            toast.error("Failed to unfollow user")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[600px] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        {type === "followers" ? "Followers" : "Following"}
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[400px] space-y-3">
                <div className="max-h-[400px] space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No {type} yet</p>
                        </div>
                    ) : (
                        users.map((userData) => (
                            <div
                                key={userData._id}
                                className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border hover:bg-muted/80 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10 border">
                                        <AvatarImage src={userData.avatar?.url || "/placeholder.svg"} />
                                        <AvatarFallback>
                                            {userData.name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-sm">{userData.name}</p>
                                        <p className="text-xs text-muted-foreground">@{userData.username}</p>
                                    </div>
                                </div>
                                {user && user._id !== userData._id && (
                                    <Button
                                        size="sm"
                                        variant={userData.isFollowedByCurrentUser ? "outline" : "default"}
                                        onClick={() =>
                                            userData.isFollowedByCurrentUser
                                                ? handleUnfollow(userData._id)
                                                : handleFollow(userData._id)
                                        }
                                        disabled={userData._id === user._id}
                                    >
                                        {userData.isFollowedByCurrentUser ? "Unfollow" : "Follow"}
                                    </Button>
                                )}
                            </div>
                        ))
                    )}
                </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default FollowersDialog
