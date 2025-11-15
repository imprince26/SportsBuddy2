import { useState } from 'react'
import { motion } from 'framer-motion'
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
import BgElements from '../BgElements'


const FeaturesSection = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null)

    const features = [
        {
            icon: Target,
            title: "Smart Event Discovery",
            description: "AI-powered recommendations find events perfectly matched to your location, skill level, and sports preferences.",
            color: "text-primary",
            bgColor: "bg-primary/10",
            gradient: "from-blue-400 to-blue-600",
            stats: "15K+ Events",
            category: "Discovery"
        },
        {
            icon: Calendar,
            title: "Event Creation & Management",
            description: "Intuitive tools to create, customize, and manage events with automated participant tracking and notifications.",
            color: "text-green-500",
            bgColor: "bg-green-500/10",
            gradient: "from-green-400 to-green-600",
            stats: "2.5K+ Hosts",
            category: "Management"
        },
        {
            icon: Users,
            title: "Team Building & Networking",
            description: "Connect with athletes who share your passion, build lasting teams, and expand your sports network.",
            color: "text-secondary",
            bgColor: "bg-secondary/10",
            gradient: "from-purple-400 to-purple-600",
            stats: "8K+ Teams",
            category: "Social"
        },
        {
            icon: MessageCircle,
            title: "Real-time Communication",
            description: "Integrated chat system with group messaging, event updates, and instant notifications for seamless coordination.",
            color: "text-yellow-500",
            bgColor: "bg-yellow-500/10",
            gradient: "from-yellow-400 to-yellow-600",
            stats: "50K+ Messages",
            category: "Communication"
        },
        {
            icon: Award,
            title: "Achievement Tracking",
            description: "Track your sports journey with detailed statistics, achievements, and progress visualization tools.",
            color: "text-red-500",
            bgColor: "bg-red-500/10",
            gradient: "from-red-400 to-red-600",
            stats: "12K+ Achievements",
            category: "Progress"
        },
        {
            icon: Smartphone,
            title: "Mobile-First Experience",
            description: "Optimized mobile app with offline capabilities, GPS integration, and push notifications for on-the-go access.",
            color: "text-indigo-500",
            bgColor: "bg-indigo-500/10",
            gradient: "from-indigo-400 to-indigo-600",
            stats: "95% Mobile",
            category: "Technology"
        },
    ]

    const highlights = [
        { label: "User Satisfaction", value: "98%", icon: Heart },
        { label: "Event Success Rate", value: "94%", icon: CheckCircle },
        { label: "Active Communities", value: "150+", icon: Globe },
        { label: "Average Rating", value: "4.9★", icon: Star },
    ]

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                duration: 0.6
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    }

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9, rotateY: -15 },
        visible: {
            opacity: 1,
            scale: 1,
            rotateY: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
                duration: 0.6
            }
        }
    }

    return (
        <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 overflow-hidden">

            <div className="container mx-auto px-4 relative z-10">
                {/* Header Section */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                    className="text-center mb-16"
                >
                    <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Platform Features</span>
                    </motion.div>

                    <motion.h2
                        variants={itemVariants}
                        className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight"
                    >
                        Why Choose{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            SportsBuddy?
                        </span>
                    </motion.h2>

                    <motion.p
                        variants={itemVariants}
                        className="text-lg text-neutral-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
                    >
                        Our platform combines cutting-edge technology with community-driven features to deliver
                        the ultimate sports networking experience.
                    </motion.p>

                    {/* Highlights Stats */}
                    <div
                        // variants={itemVariants}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
                    >
                        {highlights.map((highlight, index) => (
                            <div
                                key={index}
                                className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                            >
                                <div className="text-center">
                                    <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                        <highlight.icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="text-xl font-bold text-neutral-900 dark:text-white">{highlight.value}</div>
                                    <div className="text-xs text-neutral-600 dark:text-gray-400">{highlight.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            whileHover={{ y: -4 }}
                            className="group relative h-full"
                        >
                            <div className="h-full p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-300 shadow-md hover:shadow-lg">

                                <div className="relative z-10 h-full flex flex-col">
                                    {/* Category Badge */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-3 py-1 bg-gray-100/50 dark:bg-gray-700/50 rounded-full text-xs font-medium text-neutral-600 dark:text-gray-400 backdrop-blur-sm">
                                            {feature.category}
                                        </span>
                                        <span className={`text-xs font-bold ${feature.color}`}>
                                            {feature.stats}
                                        </span>
                                    </div>

                                    {/* Icon */}
                                    <motion.div
                                        className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        <feature.icon className={`w-8 h-8 ${feature.color}`} />
                                    </motion.div>

                                    {/* Content */}
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                                        {feature.title}
                                    </h3>

                                    <p className="text-neutral-600 dark:text-gray-400 leading-relaxed flex-grow mb-6">
                                        {feature.description}
                                    </p>

                                    {/* Action Link */}
                                    <motion.div
                                        className="flex items-center gap-2 text-sm font-medium text-primary dark:text-primary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300"
                                        whileHover={{ x: 2 }}
                                    >
                                        <span>Learn More</span>
                                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                                    </motion.div>

                                    {/* Trending Badge for top features */}
                                    {index < 2 && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -45 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                            className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                                        >
                                            <TrendingUp className="w-4 h-4 text-white" />
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="text-center mt-16"
                >
                    <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Zap className="w-6 h-6 text-yellow-300" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-lg">Ready to experience the difference?</div>
                                <div className="text-sm text-white/80">Join thousands of athletes already using SportsBuddy</div>
                            </div>
                        </div>
                        <Link to="/register">
                            <motion.button
                                whileHover={{ scale: 1.05, x: 5 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-white text-primary font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Get Started
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

            </div>

        </section>
    )
}

export default FeaturesSection
