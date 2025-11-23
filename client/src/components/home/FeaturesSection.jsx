import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Calendar,
    Users,
    Target,
    Zap,
    Award,
    Globe,
    Sparkles,
    TrendingUp,
    ArrowRight,
    CheckCircle,
    Star,
    Shield,
    Smartphone,
    MessageCircle,
    Trophy,
    Activity,
    Heart,
    MapPin,
    Clock
} from 'lucide-react'

const FeaturesSection = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null)

    const features = [
        {
            icon: Target,
            title: "Smart Event Discovery",
            description: "AI-powered recommendations find events perfectly matched to your location, skill level, and sports preferences.",
        },
        {
            icon: Calendar,
            title: "Event Creation & Management",
            description: "Intuitive tools to create, customize, and manage events with automated participant tracking and notifications.",
        },
        {
            icon: Users,
            title: "Team Building & Networking",
            description: "Connect with athletes who share your passion, build lasting teams, and expand your sports network.",
        },
        {
            icon: MessageCircle,
            title: "Real-time Communication",
            description: "Integrated chat system with group messaging, event updates, and instant notifications for seamless coordination.",
        },
        {
            icon: Award,
            title: "Achievement Tracking",
            description: "Track your sports journey with detailed statistics, achievements, and progress visualization tools.",
        },
        {
            icon: Smartphone,
            title: "Mobile-First Experience",
            description: "Optimized mobile app with offline capabilities, GPS integration, and push notifications for on-the-go access.",
        },
    ]

    return (
        <section className='py-24 bg-background border-t border-border relative overflow-hidden'>
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10" />

            <div className='container mx-auto px-4'>
                <div className='text-center max-w-3xl mx-auto mb-16'>
                    <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6'>
                        <Sparkles className='w-4 h-4' />
                        <span>Platform Features</span>
                    </div>
                    <h2 className='text-3xl md:text-4xl font-bold font-heading text-foreground mb-6'>
                        Everything you need to <br />
                        <span className='text-gradient'>elevate your game</span>
                    </h2>
                    <p className='text-lg text-muted-foreground leading-relaxed'>
                        Our platform combines cutting-edge technology with community-driven features to deliver the ultimate sports networking experience.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                    {features.map((feature, index) => (
                        <div key={index} className='group p-8 rounded-2xl bg-secondary/10 border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300'>
                            <div className='w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:border-primary transition-all duration-300'>
                                <feature.icon className='w-7 h-7 text-foreground group-hover:text-white transition-colors' />
                            </div>
                            <h3 className='text-xl font-bold font-heading text-foreground mb-3'>
                                {feature.title}
                            </h3>
                            <p className='text-muted-foreground leading-relaxed'>
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}

export default FeaturesSection
