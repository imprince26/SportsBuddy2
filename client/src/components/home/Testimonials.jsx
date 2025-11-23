import { useState } from 'react'
import { 
  Star, 
  Quote, 
  Users, 
  Trophy,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Heart,
  CheckCircle,
  Award,
} from 'lucide-react'

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Basketball Enthusiast",
      content: "SportsBuddy has completely transformed how I find local basketball games. I've met amazing people and improved my skills tremendously! The community here is incredibly supportive.",
      rating: 5,
      location: "New York",
      sport: "Basketball",
      sportIcon: "🏀",
      eventsJoined: 24,
      achievement: "Tournament Winner",
      image: "https://i.pravatar.cc/150?u=1"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Football Player",
      content: "I moved to a new city and was struggling to find people to play football with. Thanks to SportsBuddy, I now have a regular team and we've won 3 local tournaments!",
      rating: 5,
      location: "Los Angeles",
      sport: "Football",
      sportIcon: "⚽",
      eventsJoined: 18,
      achievement: "Team Captain",
      image: "https://i.pravatar.cc/150?u=2"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      role: "Tennis Player",
      content: "The event organization features are fantastic. I've hosted several tennis tournaments with ease! The platform makes coordination so much simpler.",
      rating: 5,
      location: "Miami",
      sport: "Tennis",
      sportIcon: "🎾",
      eventsJoined: 15,
      achievement: "Event Organizer",
      image: "https://i.pravatar.cc/150?u=3"
    },
  ]

  const stats = [
    { label: "Happy Athletes", value: "15K+", icon: Users },
    { label: "Success Stories", value: "95%", icon: Trophy },
    { label: "Events Completed", value: "2.8K+", icon: CheckCircle },
    { label: "Average Rating", value: "4.9★", icon: Star },
  ]

  const itemsPerSlide = 3
  const totalSlides = Math.ceil(testimonials.length / itemsPerSlide)

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const next = prev + 1
      return next >= totalSlides ? 0 : next
    })
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const previous = prev - 1
      return previous < 0 ? totalSlides - 1 : previous
    })
  }

  const getVisibleTestimonials = () => {
    const startIndex = currentSlide * itemsPerSlide
    const endIndex = Math.min(startIndex + itemsPerSlide, testimonials.length)
    return testimonials.slice(startIndex, endIndex)
  }

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary mb-6">
            <Quote className="w-4 h-4" />
            <span className="text-sm font-bold">Community Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-6">
            Loved by Athletes <span className="text-gradient">Everywhere</span>
          </h2>
          <p className="text-base text-muted-foreground">
            Join thousands of sports enthusiasts who have found their community through SportsBuddy.
            Here's what they have to say about their experience.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-secondary/10 p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-8 text-primary/10 group-hover:text-primary/20 transition-colors">
                <Quote className="w-12 h-12" />
              </div>
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              {/* Content */}
              <p className="text-muted-foreground mb-8 relative z-10 leading-relaxed">
                "{testimonial.content}"
              </p>
              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary p-1 border border-border">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-primary">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Disclaimer at the end of the section */}
        <div className="text-center mt-12 text-xs text-gray-500 dark:text-gray-400 opacity-80">
          Note: These testimonials are not real and are for demonstration purposes only.
        </div>
      </div>
    </section>
  )
}
  
  export default Testimonials