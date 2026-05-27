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
    ChevronRight,
    Loader2,
    CheckCircle
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

    const sports = athlete.sportsPreferences || [];
    const primarySport = sports[0]?.sport;
    const followersCount = athlete.followers?.length || 0;
    const eventsCount = athlete.stats?.eventsParticipated || athlete.totalEvents || 0;
    const coverImageUrl = athlete.coverImage?.url;

    // List variant
    if (variant === "list") {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="group"
            >
                <Card className="overflow-hidden border-border bg-card/95 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <Link to={`/profile/${athlete._id}`}>
                                <div className="relative">
                                    <Avatar className="w-16 h-16 border-2 border-card bg-gradient-to-br from-primary/25 via-background to-primary/10 shadow-sm ring-1 ring-primary/20">
                                        <AvatarImage src={athlete.avatar?.url} alt={athlete.name} className="object-cover bg-gradient-to-br from-primary/10 to-muted" />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-lg">
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
                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                                                <span className="truncate">{athlete.name}</span>
                                                {athlete.isVerified && <CheckCircle className="w-4 h-4 text-primary" />}
                                            </h3>
                                        </Link>
                                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>@{athlete.username}</span>
                                            {primarySport && (
                                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                    {primarySport}
                                                </span>
                                            )}
                                        </div>
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
                                        {sports.slice(0, 3).map((pref, idx) => (
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
                                            {followersCount} followers
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Trophy className="w-3.5 h-3.5" />
                                            {eventsCount} events
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
            <Card className="overflow-hidden border-border bg-card/95 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 dark:border-white/10 dark:bg-slate-950 dark:shadow-black/30 h-full flex flex-col">
                {/* Header Banner */}
                <div
                    className="h-24 bg-gradient-to-br from-primary via-blue-600 to-primary/70 relative"
                    style={coverImageUrl ? { backgroundImage: `url(${coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                >
                    {coverImageUrl && <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-blue-700/70 to-black/35" />}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />

                    {primarySport && (
                        <div className="absolute left-4 top-3 rounded-full border border-white/20 bg-white/20 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
                            {primarySport}
                        </div>
                    )}

                    {/* Avatar */}
                    <div className="absolute -bottom-8 left-4 z-10">
                        <Link to={`/profile/${athlete._id}`}>
                            <div className="relative">
                                <Avatar className="w-16 h-16 border-4 border-card bg-gradient-to-br from-slate-100 via-white to-primary/15 shadow-lg ring-2 ring-primary/20 dark:border-slate-950 dark:from-slate-800 dark:via-slate-900 dark:to-primary/25">
                                    <AvatarImage src={athlete.avatar?.url} alt={athlete.name} className="object-cover bg-gradient-to-br from-slate-100 to-primary/10 dark:from-slate-800 dark:to-slate-950" />
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-lg">
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
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate flex items-center gap-1.5">
                                <span className="truncate">{athlete.name}</span>
                                {athlete.isVerified && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
                            </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">@{athlete.username}</p>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] dark:text-slate-400">
                        {athlete.bio || `${athlete.name?.split(' ')[0] || 'Athlete'} is ready to connect, compete, and grow with the SportsBuddy community.`}
                    </p>

                    {/* Sports Tags */}
                    <div className="flex flex-wrap gap-1.5">
                        {sports.slice(0, 3).map((pref, idx) => (
                            <Badge
                                key={idx}
                                variant="secondary"
                                className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-xs dark:bg-primary/15 dark:text-blue-200"
                            >
                                {pref.sport}
                            </Badge>
                        ))}
                        {sports.length > 3 && (
                            <Badge variant="outline" className="text-xs border-border">
                                +{sports.length - 3}
                            </Badge>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-muted-foreground dark:text-slate-300">
                        <span className="flex min-w-0 items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            <span className="max-w-24 truncate">{athlete.location?.city || 'Unknown'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <Trophy className="w-3.5 h-3.5 text-primary" />
                            {eventsCount}
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            {followersCount}
                        </span>
                    </div>
                </CardContent>

                {/* Footer Actions */}
                <CardFooter className="px-4 py-3 bg-muted/30 border-t border-border flex gap-2 dark:border-white/10 dark:bg-slate-900/80">
                    <Link to={`/profile/${athlete._id}`} className="flex-1">
                        <Button
                            variant="outline"
                            className="w-full h-9 text-sm border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground dark:border-blue-400/25 dark:bg-blue-500/10 dark:text-blue-200 dark:hover:bg-blue-500 dark:hover:text-white"
                        >
                            View Profile
                            <ChevronRight className="ml-1.5 h-4 w-4" />
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
