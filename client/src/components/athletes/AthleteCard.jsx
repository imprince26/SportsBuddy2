import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AthleteCard = ({ athlete, onFollow, isFollowing, currentUser }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="group relative"
        >
            <Card className="overflow-hidden border-0 bg-card shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl h-full flex flex-col">
                <div className="h-24 bg-primary relative">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute -bottom-10 left-6">
                        <div className="relative">
                            <Avatar className="w-20 h-20 border-4 border-white dark:border-gray-900 shadow-md">
                                <AvatarImage src={athlete.avatar?.url} alt={athlete.name} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-bold text-xl">
                                    {athlete.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {athlete.isOnline && (
                                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-card rounded-full" />
                            )}
                        </div>
                    </div>
                </div>

                <CardHeader className="pt-12 pb-2 px-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <Link to={`/profile/${athlete._id}`} className="group-hover:text-blue-600 transition-colors">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-1">
                                    {athlete.name}
                                </h3>
                            </Link>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">@{athlete.username}</p>
                        </div>
                        {athlete.stats?.rating > 0 && (
                            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-lg">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">
                                    {athlete.stats.rating.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="px-6 py-2 flex-grow space-y-4">
                    {athlete.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 min-h-[2.5rem]">
                            {athlete.bio}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {athlete.sportsPreferences?.slice(0, 3).map((pref, idx) => (
                            <Badge
                                key={idx}
                                variant="secondary"
                                className="bg-primary/10 text-primary hover:bg-primary/20 border-0"
                            >
                                {pref.sport}
                            </Badge>
                        ))}
                        {athlete.sportsPreferences?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{athlete.sportsPreferences.length - 3}
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">
                                {athlete.location?.city || 'Not specified'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            <span>{athlete.stats?.eventsParticipated || 0} Events</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="px-6 py-4 bg-secondary/10 border-t border-border flex gap-3">
                    <Link to={`/profile/${athlete._id}`} className="flex-1">
                        <Button variant="secondary" className="w-full text-xs h-9 bg-secondary/50 hover:bg-secondary/30 border-0">
                            View Profile
                        </Button>
                    </Link>
                    {currentUser && currentUser._id !== athlete._id && (
                        <Button
                            size="sm"
                            onClick={() => onFollow(athlete._id)}
                            className={`h-9 px-3 transition-all duration-300 ${isFollowing
                                ? "bg-gray-100 dark:bg-green-700 text-gray-900 dark:text-white hover:bg-red-50 hover:text-red-600"
                                : "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900"
                                }`}
                        >
                            {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default AthleteCard