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

const FeaturesSection = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null)

    const features = [
        {
            icon: Target,
            title: "Smart Event Discovery",
            description: "AI-powered recommendations find events perfectly matched to your location, skill level, and sports preferences.",
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
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
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
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
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-blue-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-blue-950/20" />
                
                {/* Animated Particles */}
                {[...Array(25)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -40, 0],
                            x: [0, Math.random() * 30 - 15, 0],
                            opacity: [0.3, 0.8, 0.3],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: 5 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                            ease: "easeInOut"
                        }}
                    />
                ))}

                {/* Floating Geometric Shapes */}
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={`shape-${i}`}
                        className="absolute opacity-10"
                        style={{
                            left: `${10 + (i * 8) % 80}%`,
                            top: `${5 + (i * 12) % 90}%`,
                            width: `${25 + (i % 4) * 15}px`,
                            height: `${25 + (i % 4) * 15}px`,
                            background: `linear-gradient(135deg, ${
                                ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'][i % 6]
                            }, transparent)`,
                            borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '20%' : '10px',
                        }}
                        animate={{
                            y: [0, -30, 0],
                            rotate: [0, 180, 360],
                            scale: [1, 1.3, 1],
                        }}
                        transition={{
                            duration: 7 + (i % 4),
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.5,
                        }}
                    />
                ))}

                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div 
                        className="w-full h-full"
                        style={{
                            backgroundImage: `
                                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                            `,
                            backgroundSize: '60px 60px',
                        }}
                    />
                </div>
            </div>

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
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-full border border-gray-200/30 dark:border-gray-700/30 mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Platform Features</span>
                        <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className="w-1 h-1 bg-blue-500/60 rounded-full animate-pulse" 
                                    style={{ animationDelay: `${i * 0.2}s` }} 
                                />
                            ))}
                        </div>
                    </motion.div>

                    <motion.h2 
                        variants={itemVariants}
                        className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
                    >
                        Why Choose
                        <motion.span 
                            className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
                            animate={{ 
                                backgroundPosition: ['0%', '100%', '0%'],
                            }}
                            transition={{ duration: 5, repeat: Infinity }}
                        >
                            SportsBuddy?
                        </motion.span>
                    </motion.h2>
                    
                    <motion.p 
                        variants={itemVariants}
                        className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed mb-8"
                    >
                        Our platform combines cutting-edge technology with community-driven features to deliver 
                        the ultimate sports networking experience. Discover what makes us different.
                    </motion.p>

                    {/* Highlights Stats */}
                    <div
                        // variants={itemVariants}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
                    >
                        {highlights.map((highlight, index) => (
                            <div
                                key={index}
                                // initial={{ opacity: 0, scale: 0.8 }}
                                // whileInView={{ opacity: 1, scale: 1 }}
                                // transition={{ delay: index * 0.1, duration: 0.5 }}
                                // whileHover={{ scale: 1.05, y: -5 }}
                                className="group relative p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative z-10 text-center">
                                    <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                        <highlight.icon className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="text-xl font-bold text-gray-900 dark:text-white">{highlight.value}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{highlight.label}</div>
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
                            whileHover={{ 
                                scale: 1.05, 
                                rotateY: 5,
                                z: 50
                            }}
                            onHoverStart={() => setHoveredIndex(index)}
                            onHoverEnd={() => setHoveredIndex(null)}
                            className="group relative h-full"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <div className="h-full p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/70 dark:hover:border-gray-600/70 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-2xl">
                                {/* Background Gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                
                                {/* Animated Background Pattern */}
                                <div className="absolute inset-0 opacity-5">
                                    <motion.div
                                        className={`w-full h-full bg-gradient-to-br ${feature.gradient}`}
                                        animate={{
                                            scale: hoveredIndex === index ? [1, 1.1, 1] : 1,
                                            rotate: hoveredIndex === index ? [0, 5, 0] : 0,
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </div>

                                {/* Floating Particles for Each Card */}
                                {hoveredIndex === index && (
                                    <div className="absolute inset-0 pointer-events-none">
                                        {[...Array(6)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className={`absolute w-1 h-1 bg-gradient-to-r ${feature.gradient} rounded-full`}
                                                style={{
                                                    left: `${20 + Math.random() * 60}%`,
                                                    top: `${20 + Math.random() * 60}%`,
                                                }}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ 
                                                    opacity: [0, 1, 0],
                                                    scale: [0, 1.5, 0],
                                                    y: [0, -20, -40],
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    delay: i * 0.2,
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                <div className="relative z-10 h-full flex flex-col">
                                    {/* Category Badge */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-3 py-1 bg-gray-100/50 dark:bg-gray-700/50 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 backdrop-blur-sm">
                                            {feature.category}
                                        </span>
                                        <span className={`text-xs font-bold ${feature.color}`}>
                                            {feature.stats}
                                        </span>
                                    </div>

                                    {/* Icon */}
                                    <motion.div 
                                        className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}
                                        animate={{
                                            rotate: hoveredIndex === index ? [0, 10, -10, 0] : 0,
                                        }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <feature.icon className={`w-8 h-8 ${feature.color}`} />
                                    </motion.div>

                                    {/* Content */}
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                                        {feature.title}
                                    </h3>
                                    
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed flex-grow mb-6">
                                        {feature.description}
                                    </p>

                                    {/* Action Link */}
                                    <motion.div
                                        className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300"
                                        whileHover={{ x: 5 }}
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

                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-20 blur-xl`} />
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
                    <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl text-white shadow-2xl">
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
                                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Get Started
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

                {/* Additional Features Preview */}
                <div
                    // initial={{ opacity: 0, y: 30 }}
                    // whileInView={{ opacity: 1, y: 0 }}
                    // transition={{ duration: 0.6, delay: 0.5 }}
                    // viewport={{ once: true }}
                    className="mt-20 p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50"
                >
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Coming Soon
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            We're constantly evolving to bring you more amazing features
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: Activity, label: "Fitness Tracking", color: "text-green-500" },
                            { icon: Trophy, label: "Tournaments", color: "text-yellow-500" },
                            { icon: MapPin, label: "AR Venues", color: "text-blue-500" },
                            { icon: Shield, label: "Safety Features", color: "text-red-500" },
                        ].map((item, index) => (
                            <div
                                key={index}
                                // initial={{ opacity: 0, scale: 0.8 }}
                                // whileInView={{ opacity: 1, scale: 1 }}
                                // transition={{ delay: 0.7 + index * 0.1 }}
                                // whileHover={{ scale: 1.05 }}
                                className="text-center p-4 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm"
                            >
                                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100/50 dark:bg-gray-600/50 rounded-xl flex items-center justify-center">
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Additional Floating Elements */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900 dark:to-transparent pointer-events-none" />
            
            {/* Corner Decorative Elements */}
            <motion.div
                className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity }}
            />
            
            <motion.div
                className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-xl"
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.5, 0.2],
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
        </section>
    )
}

export default FeaturesSection