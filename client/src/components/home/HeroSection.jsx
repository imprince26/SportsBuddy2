import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  Play,
  Trophy,
  Users,
  Rocket,
  Star,
} from 'lucide-react'
import HeroBg from '../HeroBg'
import { Button } from '@/components/ui/button'

const HeroSection = () => {
  const { user } = useAuth()

  return (
    <section className='relative min-h-screen flex flex-col justify-center overflow-hidden pb-12'>
      <div className='container mx-auto px-4 relative z-10'>
        <div className='flex flex-col items-center text-center max-w-4xl mx-auto space-y-8'>

          {/* Badge */}
          <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 backdrop-blur-sm border border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-primary'></span>
            </span>
            <span className='text-sm font-medium text-muted-foreground'>
              {user ? `Welcome back, ${user.name?.split(' ')[0]}` : 'Join 15,000+ Athletes Today'}
            </span>
          </div>

          {/* Heading */}
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold font-heading tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100'>
            {user ? (
              <>
                Ready for your next <br />
                <span className='text-gradient'>Sports Adventure?</span>
              </>
            ) : (
              <>
                Find Your Perfect <br />
                <span className='text-gradient'>Sports Community</span>
              </>
            )}
          </h1>

          {/* Description */}
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200'>
            Connect with local athletes, join exciting events, and turn your passion for sports
            into lasting friendships and unforgettable experiences.
          </p>

          {/* Buttons */}
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300'>
            <Link to={user ? '/events/create' : '/register'}>
              <Button size="lg" className='h-12 px-8 rounded-full text-base shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300'>
                {user ? <Play className='w-5 h-5 mr-2' /> : <Rocket className='w-5 h-5 mr-2' />}
                {user ? 'Host New Event' : 'Start Your Journey'}
              </Button>
            </Link>
            <Link to='/events'>
              <Button variant="outline" size="lg" className='h-12 px-8 rounded-full text-base border-2 hover:bg-secondary/80'>
                <Trophy className='w-5 h-5 mr-2' />
                Browse Events
              </Button>
            </Link>
          </div>

          {/* Trust/Social Proof */}
          <div className="pt-8 flex items-center gap-4 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold">
                  <Users className="w-4 h-4" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <div className="flex text-yellow-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="font-medium text-foreground">4.9/5</span>
              <span>from 2,000+ reviews</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default HeroSection
