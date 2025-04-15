import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { showToast } from '@/components/CustomToast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Users,
  Trophy,
  ChevronRight,
  Filter,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [sportFilter, setSportFilter] = useState('all');
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [activity, setActivity] = useState([]);

  // useEffect(() => {
  //   if (!user) {
  //     navigate('/login');
  //     return;
  //   }

  //   const fetchData = async () => {
  //     setIsLoading(true);
  //     try {
  //       // Mock API calls (replace with actual endpoints)
  //       const eventsRes = await api.get('/user/events');
  //       const teamsRes = await api.get('/user/teams');
  //       const activityRes = await api.get('/user/activity');
  //       setEvents(eventsRes.data || mockEvents);
  //       setTeams(teamsRes.data || mockTeams);
  //       setActivity(activityRes.data || mockActivity);
  //     } catch (error) {
  //       showToast.error('Failed to load dashboard data');
  //       console.error(error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [user, navigate]);

  // Mock data for demo
  const mockEvents = [
    {
      id: 1,
      title: 'City Basketball Tournament',
      sport: 'Basketball',
      date: '2025-05-10',
      location: 'Downtown Arena',
      image: 'https://images.unsplash.com/photo-1515524738708-327f6b0037a7',
      joined: true,
    },
    {
      id: 2,
      title: 'Beach Volleyball Open',
      sport: 'Volleyball',
      date: '2025-06-15',
      location: 'Coastal Beach',
      image: 'https://images.unsplash.com/photo-1595437178050-7c1577ad1570',
      joined: false,
    },
  ];

  const mockTeams = [
    { id: 1, name: 'Thunder Hoops', sport: 'Basketball', members: 12 },
    { id: 2, name: 'Beach Spikers', sport: 'Volleyball', members: 8 },
  ];

  const mockActivity = [
    { id: 1, message: 'You joined City Basketball Tournament', date: '2025-04-10' },
    { id: 2, message: 'Invited to Thunder Hoops team', date: '2025-04-09' },
  ];

  const filteredEvents =
    sportFilter === 'all'
      ? events
      : events.filter((event) => event.sport === sportFilter);

  const handleJoinEvent = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/join`);
      setEvents(events.map((e) =>
        e.id === eventId ? { ...e, joined: true } : e
      ));
      showToast.success('Joined event successfully!');
    } catch (error) {
      showToast.error('Failed to join event');
      console.error(error);
    }
  };

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        'bg-background-light dark:bg-background-dark'
      )}
    >
      <main className="flex-grow container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Welcome Banner */}
          <Card
            className={cn(
              'mb-8 border',
              'bg-card-light/90 border-border-light dark:bg-card-dark/90 dark:border-border-dark'
            )}
          >
            <CardContent className="p-6 text-center">
              <motion.h1
                className={cn(
                  'text-3xl md:text-4xl font-bold mb-4',
                  'bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark'
                )}
              >
                Welcome, {user?.name}!
              </motion.h1>
              <p
                className={cn(
                  'text-lg mb-6',
                  'text-muted-foreground-light dark:text-muted-foreground-dark'
                )}
              >
                Ready to hit the court? Join events, manage teams, or check your activity.
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  asChild
                  className={cn(
                    'bg-primary-light dark:bg-primary-dark hover:bg-primary-light/80 dark:hover:bg-primary-dark/80',
                    'text-foreground-dark dark:text-foreground-light'
                  )}
                >
                  <Link to="/events">Join an Event</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className={cn(
                    'border-border-light dark:border-border-dark hover:bg-muted-light dark:hover:bg-muted-dark',
                    'text-foreground-light dark:text-foreground-dark'
                  )}
                >
                  <Link to="/teams/create">Create a Team</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Events Section */}
            <div className="lg:col-span-2">
              <Card
                className={cn(
                  'border',
                  'bg-card-light/90 border-border-light dark:bg-card-dark/90 dark:border-border-dark'
                )}
              >
                <CardHeader>
                  <CardTitle
                    className={cn(
                      'text-2xl',
                      'text-foreground-light dark:text-foreground-dark'
                    )}
                  >
                    Upcoming Events
                  </CardTitle>
                  <div className="flex gap-2">
                    {['all', 'Basketball', 'Volleyball'].map((sport) => (
                      <Button
                        key={sport}
                        variant={sportFilter === sport ? 'default' : 'outline'}
                        onClick={() => setSportFilter(sport)}
                        className={cn(
                          sportFilter === sport
                            ? 'bg-primary-light dark:bg-primary-dark text-foreground-dark dark:text-foreground-light'
                            : 'border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark'
                        )}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        {sport.charAt(0).toUpperCase() + sport.slice(1)}
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p
                      className={cn(
                        'text-center',
                        'text-muted-foreground-light dark:text-muted-foreground-dark'
                      )}
                    >
                      Loading events...
                    </p>
                  ) : filteredEvents.length === 0 ? (
                    <p
                      className={cn(
                        'text-center',
                        'text-muted-foreground-light dark:text-muted-foreground-dark'
                      )}
                    >
                      No events found.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {filteredEvents.map((event) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Card
                            className={cn(
                              'overflow-hidden',
                              'bg-card-light dark:bg-card-dark'
                            )}
                          >
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-40 object-cover"
                              loading="lazy"
                            />
                            <CardContent className="p-4">
                              <h3
                                className={cn(
                                  'text-lg font-semibold',
                                  'text-foreground-light dark:text-foreground-dark'
                                )}
                              >
                                {event.title}
                              </h3>
                              <p
                                className={cn(
                                  'text-sm',
                                  'text-muted-foreground-light dark:text-muted-foreground-dark'
                                )}
                              >
                                {event.date} | {event.location}
                              </p>
                              <Button
                                className={cn(
                                  'mt-4 w-full',
                                  event.joined
                                    ? 'bg-success-light dark:bg-success-dark hover:bg-success-light/80 dark:hover:bg-success-dark/80'
                                    : 'bg-primary-light dark:bg-primary-dark hover:bg-primary-light/80 dark:hover:bg-primary-dark/80',
                                  'text-foreground-dark dark:text-foreground-light'
                                )}
                                onClick={() => handleJoinEvent(event.id)}
                                disabled={event.joined}
                              >
                                {event.joined ? 'Joined' : 'Join Event'}
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar: Teams & Activity */}
            <div className="space-y-8">
              {/* Teams */}
              <Card
                className={cn(
                  'border',
                  'bg-card-light/90 border-border-light dark:bg-card-dark/90 dark:border-border-dark'
                )}
              >
                <CardHeader>
                  <CardTitle
                    className={cn(
                      'text-2xl',
                      'text-foreground-light dark:text-foreground-dark'
                    )}
                  >
                    Your Teams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p
                      className={cn(
                        'text-center',
                        'text-muted-foreground-light dark:text-muted-foreground-dark'
                      )}
                    >
                      Loading teams...
                    </p>
                  ) : teams.length === 0 ? (
                    <p
                      className={cn(
                        'text-center',
                        'text-muted-foreground-light dark:text-muted-foreground-dark'
                      )}
                    >
                      No teams yet.
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {teams.map((team) => (
                        <li key={team.id}>
                          <Link
                            to={`/teams/${team.id}`}
                            className={cn(
                              'flex items-center justify-between p-2 rounded-md',
                              'hover:bg-muted-light dark:hover:bg-muted-dark'
                            )}
                          >
                            <div>
                              <p
                                className={cn(
                                  'font-semibold',
                                  'text-foreground-light dark:text-foreground-dark'
                                )}
                              >
                                {team.name}
                              </p>
                              <p
                                className={cn(
                                  'text-sm',
                                  'text-muted-foreground-light dark:text-muted-foreground-dark'
                                )}
                              >
                                {team.sport} | {team.members} members
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Activity Feed */}
              <Card
                className={cn(
                  'border',
                  'bg-card-light/90 border-border-light dark:bg-card-dark/90 dark:border-border-dark'
                )}
              >
                <CardHeader>
                  <CardTitle
                    className={cn(
                      'text-2xl',
                      'text-foreground-light dark:text-foreground-dark'
                    )}
                  >
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p
                      className={cn(
                        'text-center',
                        'text-muted-foreground-light dark:text-muted-foreground-dark'
                      )}
                    >
                      Loading activity...
                    </p>
                  ) : activity.length === 0 ? (
                    <p
                      className={cn(
                        'text-center',
                        'text-muted-foreground-light dark:text-muted-foreground-dark'
                      )}
                    >
                      No recent activity.
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {activity.map((item) => (
                        <li
                          key={item.id}
                          className={cn(
                            'flex items-center gap-2',
                            'text-foreground-light dark:text-foreground-dark'
                          )}
                        >
                          <Bell className="h-5 w-5 text-accent-light dark:text-accent-dark" />
                          <div>
                            <p>{item.message}</p>
                            <p
                              className={cn(
                                'text-sm',
                                'text-muted-foreground-light dark:text-muted-foreground-dark'
                              )}
                            >
                              {item.date}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;