import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users, Calendar } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const FeaturedSports = () => {
  const { user } = useAuth()
  return (
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
  )
}

export default FeaturedSports
