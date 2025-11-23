import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  ChevronRight,
  Globe,
  Play,
  Rocket,
  Trophy,
  Users,
  Calendar,
  Target,
  Star,
  Heart,
  ArrowRight,
  Sparkles,
  Shield,
  CheckCircle,
  Crown,
  Flame
} from 'lucide-react'

const CallToAction = () => {
  const { user } = useAuth()
  const [hoveredIndex, setHoveredIndex] = useState(null)

  if (user) {
    const userActions = [
      { 
        icon: Play, 
        label: 'Host Events', 
        desc: 'Create and manage sports events',
        path: '/events/create',
        stats: '2.5K+ Created'
      },
      { 
        icon: Users, 
        label: 'Build Teams', 
        desc: 'Connect with like-minded athletes',
        path: '/community',
        stats: '8K+ Teams'
      },
      { 
        icon: Calendar, 
        label: 'Track Progress', 
        desc: 'Monitor your sports journey',
        path: '/dashboard',
        stats: '15K+ Activities'
      },
      { 
        icon: Trophy, 
        label: 'Join Tournaments', 
        desc: 'Compete and win amazing prizes',
        path: '/events?type=tournament',
        stats: '500+ Tournaments'
      }
    ]

    return (
      <section className="py-24 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-3xl p-8 md:p-12 border border-border shadow-2xl shadow-black/5">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary mb-6">
                <Crown className="w-4 h-4" />
                <span className="text-sm font-bold">Welcome back, {user.name?.split(' ')[0]}!</span>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-6">
                Ready to Level Up <span className="text-gradient">Your Game?</span>
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Create your next event, invite players to join, and build your sports community today. 
                Make every game an adventure worth remembering!
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Main CTA */}
              <div className="space-y-6">
                <div className="p-6 bg-card rounded-2xl border border-border shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                      <Rocket className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-heading text-foreground">Quick Actions</h3>
                      <p className="text-sm text-muted-foreground">What would you like to do today?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Link to="/events/create" className="block">
                      <div className="p-4 bg-secondary/50 hover:bg-primary/5 rounded-xl border border-border hover:border-primary/30 transition-all duration-200 group text-center h-full">
                        <Play className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <div className="text-sm font-bold text-foreground">Create Event</div>
                      </div>
                    </Link>

                    <Link to="/events" className="block">
                      <div className="p-4 bg-secondary/50 hover:bg-primary/5 rounded-xl border border-border hover:border-primary/30 transition-all duration-200 group text-center h-full">
                        <Target className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <div className="text-sm font-bold text-foreground">Find Events</div>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Achievement Badge */}
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                      <Flame className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">You're on fire! 🔥</div>
                      <div className="text-xs text-muted-foreground">5 events this month • Keep it up!</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Grid */}
              <div className="grid grid-cols-2 gap-4">
                {userActions.map((action, index) => (
                  <Link key={index} to={action.path} className="block h-full">
                    <div className="h-full p-6 bg-secondary/50 hover:bg-primary/5 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 group">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <action.icon className="w-5 h-5 text-foreground group-hover:text-primary-foreground" />
                      </div>
                      
                      <div className="text-sm font-bold text-foreground mb-1">
                        {action.label}
                      </div>
                      
                      <div className="text-xs text-muted-foreground mb-3 line-clamp-1">
                        {action.desc}
                      </div>
                      
                      <div className="text-xs font-bold text-primary">
                        {action.stats}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
             {/* Disclaimer at the end of the section */}
          <div className="text-center mt-12 text-xs text-gray-500 dark:text-gray-400 opacity-80">
            Disclaimer: All data shown here is for demonstration purposes only and may not reflect real or accurate statistics.
          </div>
          </div>
        </div>
      </section>
    )
  }

  // Non-authenticated user CTA
  const features = [
    { 
      icon: Users, 
      label: 'Find Athletes', 
      desc: 'Connect with local players',
    },
    { 
      icon: Calendar, 
      label: 'Join Events', 
      desc: 'Discover exciting games',
    },
    { 
      icon: Trophy, 
      label: 'Win Prizes', 
      desc: 'Compete in tournaments',
    },
    { 
      icon: Shield, 
      label: 'Safe & Secure', 
      desc: 'Verified community',
    }
  ]

  const stats = [
    { label: "Active Users", value: "15K+", icon: Users },
    { label: "Events Monthly", value: "2.5K+", icon: Calendar },
    { label: "Success Rate", value: "95%", icon: CheckCircle },
    { label: "Avg Rating", value: "4.9★", icon: Star },
  ]

  return (
    <section className="py-24 bg-background border-t border-border relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10" />

      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold">Join the Community</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-8">
              Ready to Find Your <span className="text-gradient">Sports Community?</span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
              Join SportsBuddy today and connect with thousands of sports enthusiasts in your area.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {stats.map((stat, index) => (
                <div key={index} className="p-4 bg-secondary/10 dark:bg-secondary/5 rounded-xl border border-border shadow-sm">
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-secondary flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-xl font-bold font-heading text-foreground">{stat.value}</div>
                    <div className="text-xs font-medium text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link to="/register">
              <button className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                <Rocket className="w-5 h-5" />
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            
            <Link to="/events">
              <button className="w-full sm:w-auto px-8 py-4 bg-secondary/20 border border-border hover:bg-secondary text-foreground font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                <span>Explore Events</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group bg-secondary/10 rounded-2xl p-6 text-center border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-foreground group-hover:text-primary-foreground" />
                </div>
                <div className="text-foreground font-bold mb-1">{feature.label}</div>
                <div className="text-muted-foreground text-sm">{feature.desc}</div>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-medium">4.9/5 Rating</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Verified Community</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span className="text-sm font-medium">15K+ Happy Users</span>
            </div>
          </div>
          {/* Disclaimer at the end of the section */}
          <div className="text-center mt-12 text-xs text-gray-500 dark:text-gray-400 opacity-80">
            Disclaimer: All data shown here is for demonstration purposes only and may not reflect real or accurate statistics.
          </div>
        </div>
      </div>
    </section>
  )
}

export default CallToAction
