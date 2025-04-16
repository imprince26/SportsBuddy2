import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Users,
  Calendar,
  ChevronRight,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import EventsSection from '@/components/home/EventsSection';
import CallToAction from '@/components/home/CallToAction';


const Home = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Optionally fetch user-specific data (e.g., events, teams)
    }
  }, [user]);

  

  const testimonials = [
    {
      name: 'Alex Johnson',
      quote: 'SportsBuddy helped me find a local soccer team and compete in tournaments!',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
      name: 'Emma Davis',
      quote: 'Organizing volleyball events has never been easier. Love the community!',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
    {
      name: 'Michael Chen',
      quote: 'I discovered new running partners and improved my skills with SportsBuddy.',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    },
  ];


  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        'bg-background-light dark:bg-background-dark'
      )}
    >

      <main className="flex-grow">
        {/* Hero Section */}
        <section
          className={cn(
            'relative py-20 md:py-32 overflow-hidden',
            'bg-gradient-to-b from-background-light to-muted-light dark:from-background-dark dark:to-muted-dark'
          )}
        >
          <div className="container mx-auto px-6 text-center relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={cn(
                'text-4xl md:text-6xl font-extrabold mb-6',
                'bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark'
              )}
            >
              {user
                ? `Welcome Back, ${user.name}!`
                : 'Connect, Play, Win with SportsBuddy'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={cn(
                'text-lg md:text-xl max-w-2xl mx-auto mb-8',
                'text-foreground-light dark:text-foreground-dark'
              )}
            >
              {user
                ? 'Ready to join your next game? Explore events and teams now.'
                : 'Join a vibrant community of sports enthusiasts. Find events, form teams, and celebrate victories together.'}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button
                asChild
                className={cn(
                  'text-lg px-8 py-5',
                  'bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark',
                  'text-foreground-dark dark:text-foreground-light shadow-md hover:shadow-lg'
                )}
              >
                <Link to={user ? '/dashboard' : '/register'}>
                  {user ? 'Go to Dashboard' : 'Get Started'}{' '}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section
          className={cn(
            'py-16',
            'bg-muted-light dark:bg-muted-dark'
          )}
        >
          <div className="container mx-auto px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className={cn(
                'text-3xl md:text-4xl font-bold text-center mb-12',
                'text-foreground-light dark:text-foreground-dark'
              )}
            >
              Why SportsBuddy?
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Trophy,
                  title: 'Compete & Win',
                  desc: user
                    ? 'Join tournaments and showcase your skills.'
                    : 'Participate in exciting competitions and earn rewards.',
                },
                {
                  icon: Users,
                  title: 'Build Teams',
                  desc: user
                    ? 'Connect with teammates for your next game.'
                    : 'Find players to form unbeatable teams.',
                },
                {
                  icon: Calendar,
                  title: 'Plan Events',
                  desc: user
                    ? 'Organize or join local sports events easily.'
                    : 'Discover and schedule sports events in your area.',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Card
                    className={cn(
                      'border',
                      'bg-card-light/90 border-border-light dark:bg-card-dark/90 dark:border-border-dark hover:shadow-xl transition-shadow'
                    )}
                  >
                    <CardHeader>
                      <feature.icon
                        className={cn(
                          'h-12 w-12 mx-auto mb-4',
                          'text-accent-light dark:text-accent-dark'
                        )}
                      />
                      <CardTitle
                        className={cn(
                          'text-xl text-center',
                          'text-foreground-light dark:text-foreground-dark'
                        )}
                      >
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p
                        className={cn(
                          'text-center',
                          'text-muted-foreground-light dark:text-muted-foreground-dark'
                        )}
                      >
                        {feature.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Events Section */}
       <EventsSection/>

        {/* Testimonials Section */}
        <section
          className={cn(
            'py-16',
            'bg-gradient-to-b from-muted-light to-background-light dark:from-muted-dark dark:to-background-dark'
          )}
        >
          <div className="container mx-auto px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className={cn(
                'text-3xl md:text-4xl font-bold text-center mb-12',
                'text-foreground-light dark:text-foreground-dark'
              )}
            >
              What Our Community Says
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Card
                    className={cn(
                      'border',
                      'bg-card-light/90 border-border-light dark:bg-card-dark/90 dark:border-border-dark'
                    )}
                  >
                    <CardContent className="p-6 text-center">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full mx-auto mb-4"
                        loading="lazy"
                      />
                      <p
                        className={cn(
                          'italic mb-4',
                          'text-muted-foreground-light dark:text-muted-foreground-dark'
                        )}
                      >
                        "{testimonial.quote}"
                      </p>
                      <p
                        className={cn(
                          'font-semibold',
                          'text-foreground-light dark:text-foreground-dark'
                        )}
                      >
                        {testimonial.name}
                      </p>
                      <div className="flex justify-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-5 w-5',
                              'text-accent-light dark:text-accent-dark fill-current'
                            )}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <CallToAction />
      </main>

    </div>
  );
};

export default Home;