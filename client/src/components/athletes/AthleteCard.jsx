import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MapPin,
    Trophy,
    UserPlus,
    UserCheck,
    Star,
    Users,
    Calendar,
    MessageCircle,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AthleteCard = ({ athlete, onFollow, isFollowing: initialIsFollowing, currentUser, variant = "grid" }) => {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isLoading, setIsLoading] = useState(false);

    const handleFollow = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUser) {
            toast.error('Please login to follow athletes');
            return;
        }

        setIsLoading(true);
        const wasFollowing = isFollowing;
        setIsFollowing(!wasFollowing);

        try {
            await onFollow(athlete._id);
            toast.success(wasFollowing ? `Unfollowed ${athlete.name}` : `Following ${athlete.name}`);
        } catch (error) {
            setIsFollowing(wasFollowing);
            toast.error('Failed to update follow status');
        } finally {
            setIsLoading(false);
        }
    };

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    };

    // List variant
    if (variant === "list") {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="group"
            >
                <Card className="overflow-hidden border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <Link to={`/profile/${athlete._id}`}>
                                <div className="relative">
                                    <Avatar className="w-16 h-16 border-2 border-primary/20">
                                        <AvatarImage src={athlete.avatar?.url} alt={athlete.name} className="object-cover" />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                            {getInitials(athlete.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {athlete.isOnline && (
                                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-card rounded-full" />
                                    )}
                                </div>
                            </Link>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <Link to={`/profile/${athlete._id}`}>
                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                {athlete.name}
                                            </h3>
                                        </Link>
                                        <p className="text-sm text-muted-foreground">@{athlete.username}</p>
                                    </div>

                                    {athlete.stats?.rating > 0 && (
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10">
                                            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                                            <span className="text-sm font-semibold text-primary">
                                                {athlete.stats.rating.toFixed(1)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {athlete.bio && (
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                                        {athlete.bio}
                                    </p>
                                )}

                                <div className="flex items-center flex-wrap gap-3 mt-3">
                                    {/* Sports */}
                                    <div className="flex gap-1.5">
                                        {athlete.sportsPreferences?.slice(0, 3).map((pref, idx) => (
                                            <Badge
                                                key={idx}
                                                variant="secondary"
                                                className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-xs"
                                            >
                                                {pref.sport}
                                            </Badge>
                                        ))}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {athlete.location?.city || 'Unknown'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" />
                                            {athlete.followers?.length || 0} followers
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <Link to={`/profile/${athlete._id}`}>
                                    <Button variant="outline" size="sm" className="border-border hover:bg-muted">
                                        View Profile
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </Link>
                                {currentUser && currentUser.id !== athlete._id && (
                                    <Button
                                        size="sm"
                                        onClick={handleFollow}
                                        disabled={isLoading}
                                        className={cn(
                                            "transition-all",
                                            isFollowing
                                                ? "bg-muted text-foreground hover:bg-destructive/10 hover:text-destructive"
                                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                                        )}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : isFollowing ? (
                                            <UserCheck className="w-4 h-4" />
                                        ) : (
                                            <UserPlus className="w-4 h-4" />
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    // Grid variant (default)
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group h-full"
        >
            <Card className="overflow-hidden border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                {/* Header Banner */}
                <div className="h-20 bg-gradient-to-br from-primary to-primary/70 relative">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />

                    {/* Avatar */}
                    <div className="absolute -bottom-8 left-4">
                        <Link to={`/profile/${athlete._id}`}>
                            <div className="relative">
                                <Avatar className="w-16 h-16 border-4 border-card shadow-lg">
                                    <AvatarImage src={athlete.avatar?.url} alt={athlete.name} className="object-cover" />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                        {getInitials(athlete.name)}
                                    </AvatarFallback>
                                </Avatar>
                                {athlete.isOnline && (
                                    <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-card rounded-full" />
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* Rating Badge */}
                    {athlete.stats?.rating > 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm">
                            <Star className="w-3.5 h-3.5 text-white fill-white" />
                            <span className="text-sm font-semibold text-white">
                                {athlete.stats.rating.toFixed(1)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <CardContent className="pt-10 pb-4 px-4 flex-grow space-y-3">
                    {/* Name & Username */}
                    <div>
                        <Link to={`/profile/${athlete._id}`}>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {athlete.name}
                            </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">@{athlete.username}</p>
                    </div>

                    {/* Bio */}
                    {athlete.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                            {athlete.bio}
                        </p>
                    )}

                    {/* Sports Tags */}
                    <div className="flex flex-wrap gap-1.5">
                        {athlete.sportsPreferences?.slice(0, 3).map((pref, idx) => (
                            <Badge
                                key={idx}
                                variant="secondary"
                                className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-xs"
                            >
                                {pref.sport}
                            </Badge>
                        ))}
                        {athlete.sportsPreferences?.length > 3 && (
                            <Badge variant="outline" className="text-xs border-border">
                                +{athlete.sportsPreferences.length - 3}
                            </Badge>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            {athlete.location?.city || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                            <Trophy className="w-3.5 h-3.5 text-primary" />
                            {athlete.stats?.eventsParticipated || 0}
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            {athlete.followers?.length || 0}
                        </span>
                    </div>
                </CardContent>

                {/* Footer Actions */}
                <CardFooter className="px-4 py-3 bg-muted/30 border-t border-border flex gap-2">
                    <Link to={`/profile/${athlete._id}`} className="flex-1">
                        <Button
                            variant="secondary"
                            className="w-full h-9 text-sm bg-muted hover:bg-muted/80 border-0"
                        >
                            View Profile
                        </Button>
                    </Link>
                    {currentUser && currentUser.id !== athlete._id && (
                        <Button
                            size="sm"
                            onClick={handleFollow}
                            disabled={isLoading}
                            className={cn(
                                "h-9 px-3 transition-all",
                                isFollowing
                                    ? "bg-muted text-foreground hover:bg-destructive/10 hover:text-destructive"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isFollowing ? (
                                <UserCheck className="w-4 h-4" />
                            ) : (
                                <UserPlus className="w-4 h-4" />
                            )}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default AthleteCard;