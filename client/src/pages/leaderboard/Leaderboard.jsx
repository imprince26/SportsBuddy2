import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Medal,
  Crown,
  Activity,
  Calendar,
  Search,
  Users,
  Award,
  Flame,
  Target,
  Shield,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Heart,
  MessageSquare,
  CalendarPlus,
  CheckCircle,
  BookOpen,
  Star
} from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const POINT_VALUES = [
  { action: 'Create an Event', points: 50, icon: CalendarPlus, description: 'Host your own sports event' },
  { action: 'Complete an Event', points: 30, icon: CheckCircle, description: 'Finish an event you joined' },
  { action: 'Create a Post', points: 25, icon: MessageSquare, description: 'Share with your community' },
  { action: 'Join an Event', points: 20, icon: Users, description: 'Participate in events' },
  { action: 'Join a Community', points: 15, icon: Heart, description: 'Be part of a sports group' },
  { action: 'Rate a Venue', points: 15, icon: Star, description: 'Help others find venues' },
  { action: 'Comment on Post', points: 10, icon: MessageSquare, description: 'Engage in discussions' },
  { action: 'Rate an Event', points: 10, icon: Star, description: 'Share your experience' },
  { action: 'Book a Venue', points: 10, icon: BookOpen, description: 'Reserve a facility' },
  { action: 'Like a Post', points: 2, icon: Heart, description: 'Show appreciation' },
];

const RankIndicator = ({ rank, size = 'md' }) => {
  const sizes = {
    sm: { wrapper: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-xs' },
    md: { wrapper: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-sm' },
    lg: { wrapper: 'w-14 h-14', icon: 'w-7 h-7', text: 'text-lg' },
  };

  const s = sizes[size];

  if (rank === 1) {
    return (
      <div className={cn("relative flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/40", s.wrapper)}>
        <Crown className={s.icon} />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className={cn("relative flex items-center justify-center rounded-full bg-primary/20 text-primary border-2 border-primary/30", s.wrapper)}>
        <Medal className={s.icon} />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className={cn("relative flex items-center justify-center rounded-full bg-primary/10 text-primary/80 border-2 border-primary/20", s.wrapper)}>
        <Award className={s.icon} />
      </div>
    );
  }
  return (
    <div className={cn("flex items-center justify-center rounded-full bg-secondary text-muted-foreground font-bold tabular-nums", s.wrapper, s.text)}>
      {rank}
    </div>
  );
};

const ChangeIndicator = ({ change }) => {
  if (!change || change === 0) {
    return <Minus className="w-3 h-3 text-muted-foreground/50" />;
  }
  if (change > 0) {
    return (
      <span className="flex items-center text-primary text-xs font-medium">
        <ArrowUp className="w-3 h-3 mr-0.5" />
        {change}
      </span>
    );
  }
  return (
    <span className="flex items-center text-muted-foreground/60 text-xs font-medium">
      <ArrowDown className="w-3 h-3 mr-0.5" />
      {Math.abs(change)}
    </span>
  );
};

const LevelBadge = ({ level }) => (
  <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[10px] font-bold border-primary/30 text-primary bg-primary/5">
    Lv.{level}
  </Badge>
);

const Podium = ({ topThree, onUserClick }) => {
  if (!topThree || topThree.length === 0) return null;
  const [first, second, third] = topThree;

  const PodiumSpot = ({ entry, position, pedestalHeight, delay }) => {
    if (!entry) return <div className="w-[30%] max-w-[120px]" />;

    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: 'spring', stiffness: 120, damping: 14 }}
        className={cn(
          "flex flex-col items-center cursor-pointer group",
          position === 1 ? 'w-[36%] max-w-[150px] z-20' : 'w-[30%] max-w-[120px]',
          position === 2 && 'mt-6',
          position === 3 && 'mt-10'
        )}
        onClick={() => onUserClick?.(entry.user?._id)}
      >
        {/* Avatar Container with Crown */}
        <div className="relative flex flex-col items-center mb-2">
          {/* Crown for 1st place - centered */}
          {position === 1 && (
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="flex justify-center mb-1"
            >
              <Crown className="w-7 h-7 text-primary drop-shadow-md" />
            </motion.div>
          )}

          {/* Avatar */}
          <div className="relative">
            <Avatar className={cn(
              "border-4 border-background shadow-lg transition-transform group-hover:scale-105",
              position === 1 ? 'w-16 h-16 ring-3 ring-primary/30' : 'w-14 h-14 ring-2 ring-primary/20'
            )}>
              <AvatarImage src={entry.user?.avatar?.url} />
              <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                {entry.user?.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>

            {/* Position Badge */}
            <div className={cn(
              "absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm whitespace-nowrap",
              position === 1
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-foreground'
            )}>
              {position === 1 ? '1st' : position === 2 ? '2nd' : '3rd'}
            </div>
          </div>
        </div>

        {/* Pedestal */}
        <div className={cn(
          "w-full rounded-t-lg p-3 text-center border-x border-t flex flex-col justify-center",
          position === 1
            ? 'bg-gradient-to-t from-primary/10 to-primary/5 border-primary/20'
            : 'bg-gradient-to-t from-muted/50 to-transparent border-border/50',
          pedestalHeight
        )}>
          <h3 className="font-bold text-foreground truncate text-xs group-hover:text-primary transition-colors">
            {entry.user?.name || 'Anonymous'}
          </h3>
          <p className={cn(
            "font-black tabular-nums mt-1",
            position === 1 ? 'text-xl text-primary' : 'text-base text-foreground/80'
          )}>
            {(entry.points || 0).toLocaleString()}
          </p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">pts</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex justify-center items-end gap-2 py-4 px-2 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm h-40 bg-primary/5 rounded-full blur-[60px] -z-10" />

      <PodiumSpot entry={second} position={2} pedestalHeight="h-20" delay={0.15} />
      <PodiumSpot entry={first} position={1} pedestalHeight="h-24" delay={0} />
      <PodiumSpot entry={third} position={3} pedestalHeight="h-16" delay={0.3} />
    </div>
  );
};

const LeaderboardRow = ({ entry, index, isCurrentUser, onUserClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      onClick={() => onUserClick?.(entry.user?._id)}
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200",
        isCurrentUser
          ? "bg-primary/5 border-primary/30 shadow-md shadow-primary/5"
          : "bg-card/50 border-border/50 hover:bg-card hover:border-primary/20 hover:shadow-sm"
      )}
    >
      {/* Rank */}
      <div className="flex-shrink-0 w-9">
        <RankIndicator rank={entry.rank} size="sm" />
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className={cn(
          "w-9 h-9 border-2 transition-transform group-hover:scale-105 flex-shrink-0",
          isCurrentUser ? "border-primary/30" : "border-transparent"
        )}>
          <AvatarImage src={entry.user?.avatar?.url} />
          <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
            {entry.user?.name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className={cn(
              "font-semibold truncate text-sm transition-colors",
              isCurrentUser ? "text-primary" : "text-foreground group-hover:text-primary"
            )}>
              {entry.user?.name || 'Anonymous'}
            </h3>
            {isCurrentUser && (
              <Badge className="text-[9px] h-4 px-1.5 rounded bg-primary text-primary-foreground border-0">
                You
              </Badge>
            )}
            <LevelBadge level={entry.level?.current || 1} />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
            <span className="flex items-center gap-0.5">
              <Activity className="w-3 h-3 text-primary/50" />
              {entry.eventsParticipated || 0}
            </span>
            {(entry.streak?.current || 0) > 0 && (
              <span className="flex items-center gap-0.5 text-primary/70">
                <Flame className="w-3 h-3" />
                {entry.streak.current}d
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Points */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <ChangeIndicator change={entry.change} />
        <div className="text-right min-w-[55px]">
          <p className="text-base font-bold text-foreground tabular-nums">{(entry.points || 0).toLocaleString()}</p>
          <p className="text-[9px] text-muted-foreground uppercase">pts</p>
        </div>
      </div>
    </motion.div>
  );
};

const UserStatsCard = ({ userRanking }) => {
  if (!userRanking) return null;

  const points = userRanking.points || 0;
  const level = userRanking.level?.current || 1;
  const experience = userRanking.level?.experience || 0;
  const nextLevelExp = userRanking.level?.nextLevelExp || 100;
  const eventsParticipated = userRanking.eventsParticipated || 0;
  const eventsWon = userRanking.eventsWon || 0;
  const eventsCreated = userRanking.eventsCreated || 0;
  const streak = userRanking.streak?.current || 0;
  const rank = userRanking.rank || '-';
  const percentile = userRanking.percentile || null;

  const levelProgress = nextLevelExp > 0 ? Math.min(100, Math.round((experience / nextLevelExp) * 100)) : 0;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card shadow-md overflow-hidden">
      <CardContent className="p-5 relative">
        <div className="flex items-start gap-4">
          {/* Avatar with Rank */}
          <div className="relative flex-shrink-0">
            <Avatar className="w-14 h-14 border-4 border-background shadow-lg ring-2 ring-primary/20">
              <AvatarImage src={userRanking.user?.avatar?.url} />
              <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                {userRanking.user?.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold shadow">
              #{rank}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground truncate">{userRanking.user?.name || 'You'}</h3>
            <div className="flex items-center gap-2 mt-1">
              <LevelBadge level={level} />
              {percentile && (
                <span className="text-xs text-muted-foreground">Top {percentile}%</span>
              )}
            </div>

            {/* Level Progress */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Level {level}</span>
                <span className="text-primary font-medium">{experience}/{nextLevelExp} XP</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
            </div>
          </div>

          {/* Points */}
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-black text-primary tabular-nums">{points.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-border/50">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{eventsParticipated}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Joined</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{eventsWon}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Wins</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{eventsCreated}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Hosted</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary flex items-center justify-center gap-0.5">
              {streak}
              <Flame className="w-4 h-4" />
            </p>
            <p className="text-[10px] text-muted-foreground uppercase">Streak</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const HowToEarnPoints = () => {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          How to Earn Points
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[280px] pr-3">
          <div className="space-y-2">
            {POINT_VALUES.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-0 font-bold text-xs shrink-0">
                  +{item.points}
                </Badge>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const TrophiesSection = ({ trophies, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!trophies?.earned?.length) return null;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Trophies
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {trophies.earned.length}/{trophies.stats?.totalAvailable || 8}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-4 gap-2">
          {trophies.earned.slice(0, 8).map((trophy, i) => (
            <motion.div
              key={trophy.id || i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-2 rounded-lg bg-primary/5 border border-primary/10 text-center hover:bg-primary/10 transition-colors"
              title={trophy.name}
            >
              <span className="text-lg">{trophy.icon}</span>
              <p className="text-[9px] font-medium text-foreground mt-0.5 truncate">{trophy.name}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-center items-end gap-2 py-4">
      <Skeleton className="w-[25%] h-28 rounded-t-lg" />
      <Skeleton className="w-[30%] h-32 rounded-t-lg" />
      <Skeleton className="w-[25%] h-24 rounded-t-lg" />
    </div>
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-14 rounded-xl" />
      ))}
    </div>
  </div>
);

const Leaderboard = () => {
  const navigate = useNavigate();
  const {
    leaderboard,
    loading,
    getLeaderboard,
    getLeaderboardBySport,
    getUserRanking,
    getTrophies,
    getCategories,
    categories,
    userRanking,
    trophies,
    currentUserPosition
  } = useLeaderboard();
  const { user } = useAuth();

  const [activeCategory, setActiveCategory] = useState('overall');
  const [timeframe, setTimeframe] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch initial data
  useEffect(() => {
    getCategories();
    if (user?.id) {
      getUserRanking(user.id);
      getTrophies(user.id);
    }
  }, [user]);

  // Fetch leaderboard when category or timeframe changes
  useEffect(() => {
    if (activeCategory === 'overall') {
      getLeaderboard(timeframe);
    } else {
      getLeaderboardBySport(activeCategory, timeframe);
    }
  }, [activeCategory, timeframe]);

  // Filter leaderboard by search
  const filteredLeaderboard = useMemo(() => {
    if (!searchQuery.trim()) return leaderboard;
    return leaderboard.filter(entry =>
      entry.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leaderboard, searchQuery]);

  const topThree = filteredLeaderboard.slice(0, 3);
  const restOfLeaderboard = filteredLeaderboard.length > 3 ? filteredLeaderboard.slice(3) : filteredLeaderboard;

  const handleUserClick = (userId) => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  const handleRefresh = () => {
    if (activeCategory === 'overall') {
      getLeaderboard(timeframe);
    } else {
      getLeaderboardBySport(activeCategory, timeframe);
    }
  };

  const categoryOptions = [
    { value: 'overall', label: 'Overall' },
    ...(categories || []).filter(cat => cat.id !== 'overall').map(cat => ({ value: cat.id, label: cat.name }))
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="relative border-b border-border/40 bg-background">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 pt-24 pb-6 lg:pt-28 lg:pb-8 relative">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider"
            >
              <Trophy className="w-4 h-4" />
              Global Rankings
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground"
            >
              Compete. Rise.{' '}
              <span className="text-primary">Dominate.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-sm max-w-lg mx-auto"
            >
              Earn points by participating in events, organizing games, and engaging with the community.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Main Leaderboard */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters Bar */}
            <Card className="border-border/50 p-3 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                {/* Search */}
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search athletes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 bg-background border-border/50 rounded-lg h-10 w-full focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Filters Group */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  {/* Category Filter */}
                  <Select value={activeCategory} onValueChange={setActiveCategory}>
                    <SelectTrigger className="w-full sm:w-[140px] bg-background border-border/50 rounded-lg h-10 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-2 w-full">
                        <SelectValue className="truncate" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Timeframe Filter */}
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="w-full sm:w-[140px] bg-background border-border/50 rounded-lg h-10 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-2 w-full">
                        <SelectValue className="truncate" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="monthly">This Month</SelectItem>
                      <SelectItem value="weekly">This Week</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Refresh Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="rounded-lg border-border/50 hover:bg-primary/10 hover:border-primary/30 h-10 w-10 flex-shrink-0 transition-all"
                    title="Refresh leaderboard"
                  >
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Podium & List */}
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Podium */}
                {topThree.length > 0 && !searchQuery && (
                  <Card className="border-border/50 p-3 overflow-hidden">
                    <Podium topThree={topThree} onUserClick={handleUserClick} />
                  </Card>
                )}

                {/* Leaderboard List */}
                <Card className="border-border/50 p-3">
                  <div className="space-y-2">
                    {searchQuery && filteredLeaderboard.length > 0 && (
                      <p className="text-xs text-muted-foreground mb-3 px-1">
                        Found {filteredLeaderboard.length} results for "{searchQuery}"
                      </p>
                    )}

                    {/* Current User Sticky (if not in view) */}
                    {user && currentUserPosition && !filteredLeaderboard.find(e => e.user?._id === user.id) && (
                      <div className="mb-3 p-0.5 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20">
                        <LeaderboardRow
                          entry={currentUserPosition}
                          index={0}
                          isCurrentUser={true}
                          onUserClick={handleUserClick}
                        />
                      </div>
                    )}

                    <AnimatePresence mode="popLayout">
                      {restOfLeaderboard.map((entry, index) => (
                        <LeaderboardRow
                          key={entry._id || index}
                          entry={entry}
                          index={searchQuery ? index : index + 3}
                          isCurrentUser={entry.user?._id === user?.id}
                          onUserClick={handleUserClick}
                        />
                      ))}
                    </AnimatePresence>

                    {filteredLeaderboard.length === 0 && !loading && (
                      <div className="text-center py-12">
                        <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-1">No athletes found</h3>
                        <p className="text-sm text-muted-foreground">
                          {searchQuery ? 'Try a different search term' : 'Be the first to join!'}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* Right Column: User Stats & Info */}
          <div className="space-y-4">
            {/* User Stats Card */}
            {user && userRanking && (
              <UserStatsCard userRanking={userRanking} />
            )}

            {/* Trophies */}
            {user && trophies && (
              <TrophiesSection trophies={trophies} loading={loading} />
            )}

            {/* How to Earn Points */}
            <HowToEarnPoints />

            {/* Not Logged In CTA */}
            {!user && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-5 text-center">
                  <h3 className="font-bold text-foreground mb-1">Join the Competition</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign in to track your ranking and compete worldwide.
                  </p>
                  <Button className="w-full" asChild>
                    <Link to="/login">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
