import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Basketball Enthusiast",
      avatar: "/placeholder.svg?height=80&width=80",
      content: "SportsBuddy has completely transformed how I find local basketball games. I've met amazing people and improved my skills tremendously!",
      rating: 5,
      location: "New York"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Football Player",
      avatar: "/placeholder.svg?height=80&width=80",
      content: "I moved to a new city and was struggling to find people to play football with. Thanks to SportsBuddy, I now have a regular team!",
      rating: 5,
      location: "Los Angeles"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      role: "Tennis Player",
      avatar: "/placeholder.svg?height=80&width=80",
      content: "The event organization features are fantastic. I've hosted several tennis tournaments with ease!",
      rating: 4,
      location: "Miami"
    },
  ]
  return (
    <section className="py-20 bg-muted-light/30 dark:bg-muted-dark/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground-light dark:text-foreground-dark mb-6">
            What Our Community Says
          </h2>
          <p className="text-xl text-muted-foreground-light dark:text-muted-foreground-dark max-w-3xl mx-auto">
            Join thousands of satisfied athletes who have found their perfect sports community with SportsBuddy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-full p-8 bg-card-light dark:bg-card-dark rounded-2xl shadow-lg border border-border-light dark:border-border-dark hover:shadow-2xl transition-all duration-300 hover:scale-105">
                {/* Rating Stars */}
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={`${i < testimonial.rating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300 dark:text-gray-600"
                        }`}
                    />
                  ))}
                </div>

                {/* Testimonial Content */}
                <blockquote className="text-foreground-light dark:text-foreground-dark mb-6 text-lg leading-relaxed italic">
                  "{testimonial.content}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-light to-accent-light dark:from-primary-dark dark:to-accent-dark rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground-light dark:text-foreground-dark">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                      {testimonial.role} • {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
