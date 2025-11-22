import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  User,
  MapPin,
  Activity,
  Calendar
} from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

const RankBadge = ({ rank }) => {
  if (rank === 1) {
    return (
      <div className="relative">
        <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500 animate-bounce" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-200 rounded-full animate-ping" />
      </div>
    );
  }
  if (rank === 2) return <Medal className="w-7 h-7 text-gray-400 fill-gray-400" />;
  if (rank === 3) return <Medal className="w-6 h-6 text-amber-600 fill-amber-600" />;
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground">
      <span className="text-sm font-bold">#{rank}</span>
    </div>
  );
};

const LeaderboardRow = ({ entry, index, isCurrentUser }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
        isCurrentUser 
          ? 'bg-primary/10 border-primary shadow-sm' 
          : 'bg-card border-border hover:bg-accent hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-center w-12 flex-shrink-0">
        <RankBadge rank={entry.rank} />
      </div>

      <div className="flex items-center gap-4 flex-grow min-w-0">
        <div className="relative">
          <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
            <AvatarImage src={entry.user?.avatar?.url} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {entry.user?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {index < 3 && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center shadow-sm border border-border">
              {index === 0 && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
              {index === 1 && <Medal className="w-4 h-4 text-gray-400 fill-gray-400" />}
              {index === 2 && <Medal className="w-4 h-4 text-amber-600 fill-amber-600" />}
            </div>
          )}
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold truncate ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
              {entry.user?.name}
            </h3>
            {isCurrentUser && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary">
                You
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {entry.user?.location?.city || 'Global'}
            </span>
            <span className="w-1 h-1 bg-border rounded-full" />
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {entry.eventsParticipated || 0} Events
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="text-xl font-bold text-foreground tabular-nums">
          {entry.points?.toLocaleString()}
        </div>
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Points</div>
      </div>
    </motion.div>
  );
};

const Podium = ({ topThree }) => {
  if (!topThree || topThree.length === 0) return null;

  const [first, second, third] = topThree;

  return (
    <div className="flex justify-center items-end gap-4 mb-12 min-h-[280px] px-4">
      {/* Second Place */}
      {second && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center w-1/3 max-w-[160px]"
        >
          <div className="relative mb-4">
            <Avatar className="w-20 h-20 border-4 border-gray-400 shadow-xl">
              <AvatarImage src={second.user?.avatar?.url} />
              <AvatarFallback>{second.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
              <Medal className="w-3 h-3" />
              2nd
            </div>
          </div>
          <div className="w-full bg-card rounded-t-2xl p-4 text-center border-t border-x border-border h-32 flex flex-col justify-end shadow-sm">
            <h3 className="font-bold text-foreground truncate w-full text-sm mb-1">{second.user?.name}</h3>
            <p className="text-muted-foreground font-bold text-lg">{second.points?.toLocaleString()}</p>
          </div>
        </motion.div>
      )}

      {/* First Place */}
      {first && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center w-1/3 max-w-[180px] z-10"
        >
          <div className="relative mb-4">
            <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-500 fill-yellow-500 animate-bounce" />
            <Avatar className="w-24 h-24 border-4 border-yellow-400 shadow-2xl ring-4 ring-yellow-400/20">
              <AvatarImage src={first.user?.avatar?.url} />
              <AvatarFallback>{first.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
              <Crown className="w-3 h-3" />
              1st
            </div>
          </div>
          <div className="w-full bg-card rounded-t-2xl p-4 text-center border-t border-x border-primary/30 h-40 flex flex-col justify-end shadow-lg">
            <h3 className="font-bold text-foreground truncate w-full text-base mb-1">{first.user?.name}</h3>
            <p className="text-primary font-bold text-xl">{first.points?.toLocaleString()}</p>
          </div>
        </motion.div>
      )}

      {/* Third Place */}
      {third && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center w-1/3 max-w-[160px]"
        >
          <div className="relative mb-4">
            <Avatar className="w-20 h-20 border-4 border-amber-600 shadow-xl">
              <AvatarImage src={third.user?.avatar?.url} />
              <AvatarFallback>{third.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
              <Medal className="w-3 h-3" />
              3rd
            </div>
          </div>
          <div className="w-full bg-card rounded-t-2xl p-4 text-center border-t border-x border-border h-24 flex flex-col justify-end shadow-sm">
            <h3 className="font-bold text-foreground truncate w-full text-sm mb-1">{third.user?.name}</h3>
            <p className="text-muted-foreground font-bold text-lg">{third.points?.toLocaleString()}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const Leaderboard = () => {
  const { 
    leaderboard, 
    loading, 
    getLeaderboard,
    getLeaderboardBySport,
    currentUserPosition,
    categories,
    getCategories
  } = useLeaderboard();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('overall');
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    // Map activeCategory to timeframe for the API call
    const timeframeMap = {
      'overall': 'all',
      'monthly': 'monthly',
      'weekly': 'weekly',
      'football': 'all',
      'basketball': 'all',
      'tennis': 'all',
      'cricket': 'all',
      'volleyball': 'all',
      'badminton': 'all',
      'swimming': 'all',
      'running': 'all',
      'cycling': 'all'
    };
    
    const apiTimeframe = timeframeMap[activeCategory] || timeframe;
    
    // If category is a sport, use sport-specific leaderboard
    if (activeCategory !== 'overall' && activeCategory !== 'monthly' && activeCategory !== 'weekly') {
      getLeaderboardBySport(activeCategory, timeframe);
    } else {
      getLeaderboard(apiTimeframe);
    }
  }, [activeCategory, timeframe]);

  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Global <span className="text-primary">Leaderboard</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Compete with athletes worldwide. Earn points by participating in events, winning matches, and organizing games.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full max-w-3xl">
              <TabsList className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 h-auto p-1 bg-muted rounded-xl gap-1">
                {categories.map((cat) => (
                  <TabsTrigger 
                    key={cat.id} 
                    value={cat.id}
                    className="rounded-lg py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    <span className="hidden sm:inline">{cat.name}</span>
                    <span className="sm:hidden">{cat.name.charAt(0)}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Filters */}
        <div className="flex justify-end mb-8">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px] bg-card">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="weekly">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="flex justify-center items-end gap-4 mb-12 h-[280px]">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className={`w-1/3 max-w-[160px] rounded-t-2xl ${i === 2 ? 'h-40' : i === 1 ? 'h-32' : 'h-24'}`} />
              ))}
            </div>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            <Podium topThree={topThree} />

            <div className="space-y-3">
              {/* Current User Sticky Row (if not in top view) */}
              {currentUserPosition && !leaderboard.find(u => u.user._id === user?._id) && (
                <div className="sticky top-4 z-20 mb-6 shadow-lg">
                  <LeaderboardRow 
                    entry={currentUserPosition} 
                    index={currentUserPosition.rank - 1} 
                    isCurrentUser={true} 
                  />
                </div>
              )}

              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                {restOfLeaderboard.length > 0 ? (
                  <div className="divide-y divide-border">
                    {restOfLeaderboard.map((entry, index) => (
                      <LeaderboardRow
                        key={entry._id}
                        entry={entry}
                        index={index + 3}
                        isCurrentUser={entry.user?._id === user?._id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No rankings yet</h3>
                    <p className="text-muted-foreground">Be the first to earn points in this category!</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
