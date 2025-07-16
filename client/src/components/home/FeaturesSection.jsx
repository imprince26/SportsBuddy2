import { motion } from "framer-motion"
import {
    Calendar,
    Users,
    Target,
    Zap,
    Award,
    Globe,
} from "lucide-react"

const FeaturesSection = () => {
    const features = [
        {
            icon: Target,
            title: "Find Local Events",
            description: "Discover sports events happening near you, filtered by your favorite activities and skill level.",
            color: "text-blue-500",
            bgColor: "bg-blue-500/10"
        },
        {
            icon: Calendar,
            title: "Create & Host Events",
            description: "Easily organize your own sports events, manage participants, and build your community.",
            color: "text-green-500",
            bgColor: "bg-green-500/10"
        },
        {
            icon: Users,
            title: "Join Teams",
            description: "Connect with other players, join existing teams, or create your own for regular meetups.",
            color: "text-purple-500",
            bgColor: "bg-purple-500/10"
        },
        {
            icon: Zap,
            title: "Real-time Chat",
            description: "Communicate with event participants through our integrated real-time messaging system.",
            color: "text-yellow-500",
            bgColor: "bg-yellow-500/10"
        },
        {
            icon: Award,
            title: "Track Achievements",
            description: "Record your sports accomplishments and share them with the community.",
            color: "text-red-500",
            bgColor: "bg-red-500/10"
        },
        {
            icon: Globe,
            title: "Mobile Friendly",
            description: "Access SportsBuddy on any device, anywhere - perfect for on-the-go athletes.",
            color: "text-indigo-500",
            bgColor: "bg-indigo-500/10"
        },
    ]
    return (
        <section className="py-20 bg-background-light dark:bg-background-dark">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl lg:text-5xl font-bold text-foreground-light dark:text-foreground-dark mb-6">
                        Why Choose SportsBuddy?
                    </h2>
                    <p className="text-xl text-muted-foreground-light dark:text-muted-foreground-dark max-w-3xl mx-auto">
                        Our platform offers everything you need to connect with fellow sports enthusiasts and organize memorable
                        experiences that last a lifetime.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group"
                        >
                            <div className="h-full p-8 bg-card-light dark:bg-card-dark rounded-2xl shadow-lg border border-border-light dark:border-border-dark hover:shadow-2xl transition-all duration-300 hover:scale-105">
                                <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-foreground-light dark:text-foreground-dark mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground-light dark:text-muted-foreground-dark leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FeaturesSection
