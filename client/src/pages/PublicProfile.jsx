import { useEffect, useState } from 'react';
import { useParams, useNavigate,Link } from 'react-router-dom';
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
  User,
  Calendar,
  Users,
  Trophy,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/utils/api';

const PublicProfile = () => {
  const { user: currentUser,getUserProfile } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await getUserProfile(userId);
        setProfile(res);
      } catch (error) {
        showToast.error('User not found or profile is private');
        navigate('/dashboard');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, navigate]);

  // Mock data for demo
  const mockEvents = [
    {
      id: 1,
      title: 'City Basketball Tournament',
      date: '2025-05-10',
      image: 'https://images.unsplash.com/photo-1515524738708-327f6b0037a7',
    },
  ];

  const mockTeams = [
    { id: 1, name: 'Thunder Hoops', sport: 'Basketball', members: 12 },
  ];

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      await api.post(`/user/${userId}/follow`);
      showToast.success(`Followed ${userId}!`);
    } catch (error) {
      showToast.error('Failed to follow user');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          'min-h-screen flex flex-col',
          'bg-background-light dark:bg-background-dark'
        )}
      >
        <main
          className={cn(
            'flex-grow container mx-auto px-6 py-8 text-center',
            'text-foreground-light dark:text-foreground-dark'
          )}
        >
          Loading...
        </main>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div>
              <Card
                className={cn(
                  'border',
                  'bg-card-light/90 border-border-light dark:bg-card-dark/90 dark:border-border-dark'
                )}
              >
                <CardContent className="p-6 text-center">
                  <motion.img
                    src={profile.avatar || 'https://randomuser.me/api/portraits/men/1.jpg'}
                    alt={`${profile.username}'s avatar`}
                    className="w-32 h-32 rounded-full mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    loading="lazy"
                  />
                  <h2
                    className={cn(
                      'text-2xl font-bold',
                      'text-foreground-light dark:text-foreground-dark'
                    )}
                  >
                    {profile.name}
                  </h2>
                  <p
                    className={cn(
                      'text-sm',
                      'text-muted-foreground-light dark:text-muted-foreground-dark'
                    )}
                  >
                    @{profile.username}
                  </p>
                  <p
                    className={cn(
                      'mt-2',
                      'text-foreground-light dark:text-foreground-dark'
                    )}
                  >
                    {profile.bio || 'No bio available.'}
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    <p
                      className={cn(
                        'text-sm',
                        'text-muted-foreground-light dark:text-muted-foreground-dark'
                      )}
                    >
                      <span className="font-semibold">{profile.eventsCount || 0}</span> Events
                    </p>
                    <p
                      className={cn(
                        'text-sm',
                        'text-muted-foreground-light dark:text-muted-foreground-dark'
                      )}
                    >
                      <span className="font-semibold">{profile.teamsCount || 0}</span> Teams
                    </p>
                  </div>
                  {currentUser?.username !== profile.username && (
                    <Button
                      onClick={handleFollow}
                      className={cn(
                        'mt-4 w-full',
                        'bg-primary-light dark:bg-primary-dark hover:bg-primary-light/80 dark:hover:bg-primary-dark/80',
                        'text-foreground-dark dark:text-foreground-light'
                      )}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Follow
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Events & Teams */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Events */}
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
                    Recent Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mockEvents.length === 0 ? (
                    <p
                      className={cn(
                        'text-center',
                        'text-muted-foreground-light dark:text-muted-foreground-dark'
                      )}
                    >
                      No public events.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {mockEvents.map((event) => (
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
                                {event.date}
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

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
                    Teams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mockTeams.length === 0 ? (
                    <p
                      className={cn(
                        'text-center',
                        'text-muted-foreground-light dark:text-muted-foreground-dark'
                      )}
                    >
                      No public teams.
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {mockTeams.map((team) => (
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
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PublicProfile;