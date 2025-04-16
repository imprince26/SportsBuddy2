import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CallToAction = () => {
  const { user } = useAuth()
  return (
    <section
    className={cn(
      'py-16',
      'bg-background-light dark:bg-background-dark'
    )}
  >
    <div className="container mx-auto px-6 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className={cn(
          'text-3xl md:text-4xl font-bold mb-6',
          'text-foreground-light dark:text-foreground-dark'
        )}
      >
        {user ? 'Ready for Your Next Game?' : 'Join the SportsBuddy Community'}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
        className={cn(
          'text-lg mb-8 max-w-xl mx-auto',
          'text-muted-foreground-light dark:text-muted-foreground-dark'
        )}
      >
        {user
          ? 'Explore events, connect with teams, and take your sports journey to the next level.'
          : 'Sign up now and start your sports journey with SportsBuddy.'}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <Button
          asChild
          className={cn(
            'text-lg px-8 py-3',
            'bg-primary-light dark:bg-primary-dark hover:bg-primary-light/80 dark:hover:bg-primary-dark/80',
            'text-foreground-dark dark:text-foreground-light shadow-md hover:shadow-lg'
          )}
        >
          <Link to={user ? '/events' : '/register'}>
            {user ? 'Explore Events' : 'Join Now'}{' '}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </motion.div>
    </div>
  </section>
  )
}

export default CallToAction
