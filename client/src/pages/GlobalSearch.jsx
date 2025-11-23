import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Users, ArrowRight, Loader2, User as UserIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/utils/api';
import EventCard from '@/components/events/EventCard';
import VenueCard from '@/components/venues/VenueCard';
import HeroBg from '@/components/HeroBg';

const categories = [
    { value: "Football", label: "Football", icon: "⚽" },
    { value: "Basketball", label: "Basketball", icon: "🏀" },
    { value: "Tennis", label: "Tennis", icon: "🎾" },
    { value: "Running", label: "Running", icon: "🏃" },
    { value: "Cycling", label: "Cycling", icon: "🚴" },
    { value: "Swimming", label: "Swimming", icon: "🏊" },
    { value: "Volleyball", label: "Volleyball", icon: "🏐" },
    { value: "Cricket", label: "Cricket", icon: "🏏" },
    { value: "Gymnastics", label: "Gymnastics", icon: "🤸" },
    { value: "Badminton", label: "Badminton", icon: "🏸" },
    { value: "Athletics", label: "Athletics", icon: "🏃" },
    { value: "Hockey", label: "Hockey", icon: "🏑" },
    { value: "Other", label: "Other", icon: "🏅" }
];

const UserCard = ({ user }) => (
    <Link to={`/profile/${user._id}`} className="block h-full">
        <Card className="h-full hover:shadow-md transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarImage src={user.avatar?.url} alt={user.name} />
                    <AvatarFallback className="bg-primary/5 text-primary">
                        {user.name?.charAt(0) || <UserIcon className="w-4 h-4" />}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">{user.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                    {user.bio && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{user.bio}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    </Link>
);

const GlobalSearch = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({
        events: [],
        venues: [],
        users: []
    });

    const timerRef = useRef(null);

    const handleSearch = (value) => {
        setQuery(value);

        if (timerRef.current) clearTimeout(timerRef.current);

        if (!value.trim()) {
            setResults({ events: [], venues: [], users: [] });
            setSearchParams({});
            return;
        }

        setSearchParams({ q: value });
        setLoading(true);

        timerRef.current = setTimeout(async () => {
            try {
                const [eventsRes, venuesRes, usersRes] = await Promise.all([
                    api.get(`/events?search=${value}&limit=6`),
                    api.get(`/venues/search?q=${value}&limit=6`),
                    api.get(`/users/search?q=${value}`)
                ]);

                setResults({
                    events: eventsRes.data.success ? eventsRes.data.data : [],
                    venues: venuesRes.data.success ? venuesRes.data.data : [],
                    users: usersRes.data.success ? usersRes.data.data : []
                });
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        }, 500);
    };

    useEffect(() => {
        if (initialQuery) {
            handleSearch(initialQuery);
        }
    }, []);

    const hasResults = results.events.length > 0 || results.venues.length > 0 || results.users.length > 0;

    return (
        <div className="min-h-screen bg-background relative">
            <HeroBg />

            <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Header & Search Input */}
                    <div className="text-center space-y-6">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            Search <span className="text-primary">SportsBuddy</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Find events, venues, and athletes across the platform.
                        </p>

                        <div className="relative max-w-2xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input
                                value={query}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search for anything..."
                                className="pl-12 h-14 text-lg rounded-2xl shadow-lg border-border/50 bg-background/80 backdrop-blur-xl focus-visible:ring-primary/30"
                                autoFocus
                            />
                            {loading && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="mt-12">
                        {!query.trim() ? (
                            <div className="text-center py-20 opacity-50">
                                <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-xl font-medium">Start typing to search</p>
                            </div>
                        ) : !loading && !hasResults ? (
                            <div className="text-center py-20">
                                <p className="text-xl font-medium text-muted-foreground">No results found for "{query}"</p>
                            </div>
                        ) : (
                            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="w-full justify-start h-auto p-1 bg-secondary/50 backdrop-blur-sm rounded-xl mb-8 overflow-x-auto">
                                    <TabsTrigger value="all" className="rounded-lg px-6 py-2.5">All Results</TabsTrigger>
                                    <TabsTrigger value="events" className="rounded-lg px-6 py-2.5">
                                        Events <Badge variant="secondary" className="ml-2 bg-background/50">{results.events.length}</Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="venues" className="rounded-lg px-6 py-2.5">
                                        Venues <Badge variant="secondary" className="ml-2 bg-background/50">{results.venues.length}</Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="users" className="rounded-lg px-6 py-2.5">
                                        Users <Badge variant="secondary" className="ml-2 bg-background/50">{results.users.length}</Badge>
                                    </TabsTrigger>
                                </TabsList>

                                {/* All Tab */}
                                <TabsContent value="all" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Users Section */}
                                    {results.users.length > 0 && (
                                        <section>
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                                    <Users className="w-6 h-6 text-primary" /> People
                                                </h2>
                                                <Button variant="ghost" onClick={() => setActiveTab('users')} className="text-primary hover:text-primary/80">
                                                    View All <ArrowRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                {results.users.slice(0, 6).map(user => (
                                                    <UserCard key={user._id} user={user} />
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Venues Section */}
                                    {results.venues.length > 0 && (
                                        <section>
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                                    <MapPin className="w-6 h-6 text-primary" /> Venues
                                                </h2>
                                                <Button variant="ghost" onClick={() => setActiveTab('venues')} className="text-primary hover:text-primary/80">
                                                    View All <ArrowRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {results.venues.slice(0, 3).map(venue => (
                                                    <div key={venue._id} className="h-[380px]">
                                                        <VenueCard venue={venue} />
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Events Section */}
                                    {results.events.length > 0 && (
                                        <section>
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                                    <Calendar className="w-6 h-6 text-primary" /> Events
                                                </h2>
                                                <Button variant="ghost" onClick={() => setActiveTab('events')} className="text-primary hover:text-primary/80">
                                                    View All <ArrowRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {results.events.slice(0, 3).map(event => (
                                                    <EventCard key={event._id} event={event} categories={categories} />
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </TabsContent>

                                <TabsContent value="events" className="animate-in fade-in slide-in-from-bottom-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {results.events.map(event => (
                                            <EventCard key={event._id} event={event} categories={categories} />
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="venues" className="animate-in fade-in slide-in-from-bottom-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {results.venues.map(venue => (
                                            <div key={venue._id} className="h-[380px]">
                                                <VenueCard venue={venue} />
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="users" className="animate-in fade-in slide-in-from-bottom-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {results.users.map(user => (
                                            <UserCard key={user._id} user={user} />
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
