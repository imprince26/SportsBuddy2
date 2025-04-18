"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useEvents } from "@/context/EventContext"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { Calendar, MapPin, Users, ArrowRight, Search, Trophy, Star } from "lucide-react"

const Home = () => {
  const { events, getEvents: fetchEvents, loading } = useEvents()
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    if (events.length > 0) {
      const now = new Date()
      const upcoming = events
        .filter((event) => new Date(event.date) > now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 6)
      setUpcomingEvents(upcoming)
    }
  }, [events])

  const categories = [
    { id: "all", name: "All Sports", icon: "🏆" },
    { id: "Football", name: "Football", icon: "⚽" },
    { id: "Basketball", name: "Basketball", icon: "🏀" },
    { id: "Tennis", name: "Tennis", icon: "🎾" },
    { id: "Running", name: "Running", icon: "🏃" },
    { id: "Cycling", name: "Cycling", icon: "🚴" },
    { id: "Swimming", name: "Swimming", icon: "🏊" },
    { id: "Volleyball", name: "Volleyball", icon: "🏐" },
    { id: "Cricket", name: "Cricket", icon: "🏏" },
  ]

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Basketball Enthusiast",
      avatar: "/placeholder.svg?height=80&width=80",
      content:
        "SportsBuddy has completely transformed how I find local basketball games. I've met amazing people and improved my skills tremendously!",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Football Player",
      avatar: "/placeholder.svg?height=80&width=80",
      content:
        "I moved to a new city and was struggling to find people to play football with. Thanks to SportsBuddy, I now have a regular team and we meet twice a week!",
      rating: 5,
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      role: "Tennis Player",
      avatar: "/placeholder.svg?height=80&width=80",
      content:
        "The event organization features are fantastic. I've hosted several tennis tournaments and the platform makes it incredibly easy to manage participants.",
      rating: 4,
    },
  ]

  const features = [
    {
      icon: "🔍",
      title: "Find Local Events",
      description: "Discover sports events happening near you, filtered by your favorite activities and skill level.",
    },
    {
      icon: "📅",
      title: "Create & Host Events",
      description: "Easily organize your own sports events, manage participants, and build your community.",
    },
    {
      icon: "👥",
      title: "Join Teams",
      description: "Connect with other players, join existing teams, or create your own for regular meetups.",
    },
    {
      icon: "💬",
      title: "Real-time Chat",
      description: "Communicate with event participants through our integrated real-time messaging system.",
    },
    {
      icon: "🏆",
      title: "Track Achievements",
      description: "Record your sports accomplishments and share them with the community.",
    },
    {
      icon: "📱",
      title: "Mobile Friendly",
      description: "Access SportsBuddy on any device, anywhere - perfect for on-the-go athletes.",
    },
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    window.location.href = `/events?search=${searchTerm}`
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-light to-accent-light dark:from-primary-dark dark:to-accent-dark py-20 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <svg
            className="absolute left-0 top-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="rgba(255,255,255,0.05)"
              fillOpacity="1"
              d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Find Your Perfect <span className="text-yellow-300">Sports Buddy</span>
              </motion.h1>
              <motion.p
                className="text-lg md:text-xl text-white/90 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Connect with local sports enthusiasts, join exciting events, and build your sports community.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row justify-center md:justify-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link
                  to="/events"
                  className="px-6 py-3 bg-white text-primary-light dark:text-primary-dark font-semibold rounded-md hover:bg-white/90 transition-colors"
                >
                  Explore Events
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-md hover:bg-white/10 transition-colors"
                >
                  Sign Up Free
                </Link>
              </motion.div>
            </div>
            <div className="md:w-1/2">
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Sports activities"
                  className="rounded-lg shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center">
                  <div className="bg-primary-light dark:bg-primary-dark rounded-full w-12 h-12 flex items-center justify-center mr-3">
                    <Users className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">Active Users</p>
                    <p className="text-xl font-bold text-foreground-light dark:text-foreground-dark">10,000+</p>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center">
                  <div className="bg-accent-light dark:bg-accent-dark rounded-full w-12 h-12 flex items-center justify-center mr-3">
                    <Calendar className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">Weekly Events</p>
                    <p className="text-xl font-bold text-foreground-light dark:text-foreground-dark">500+</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-background-light dark:bg-background-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-6 -mt-20 relative z-20">
              <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-6 text-center">
                Find Sports Events Near You
              </h2>
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search events, sports, locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-md hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted-light/30 dark:bg-muted-dark/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground-light dark:text-foreground-dark mb-4">
              Popular Sports Categories
            </h2>
            <p className="text-muted-foreground-light dark:text-muted-foreground-dark max-w-2xl mx-auto">
              Discover events across a wide range of sports and activities. Find your passion and connect with others
              who share it.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={category.id === "all" ? "/events" : `/events?category=${category.id}`}
                className={`flex flex-col items-center p-6 rounded-lg transition-all duration-200 ${selectedCategory === category.id
                    ? "bg-primary-light/10 dark:bg-primary-dark/10 border-2 border-primary-light dark:border-primary-dark"
                    : "bg-card-light dark:bg-card-dark hover:bg-primary-light/5 dark:hover:bg-primary-dark/5 border-2 border-transparent"
                  }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="text-4xl mb-3">{category.icon}</span>
                <span className="text-foreground-light dark:text-foreground-dark font-medium text-center">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16 bg-background-light dark:bg-background-dark">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-foreground-light dark:text-foreground-dark">Upcoming Events</h2>
            <Link to="/events" className="flex items-center text-primary-light dark:text-primary-dark hover:underline">
              View all events <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-light dark:border-primary-dark"></div>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Link
                  to={`/events/${event._id}`}
                  key={event._id}
                  className="group bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    {event.images && event.images.length > 0 ? (
                      <img
                        src={event.images[0].url || "/placeholder.svg?height=192&width=384"}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted-light dark:bg-muted-dark flex items-center justify-center">
                        <span className="text-muted-foreground-light dark:text-muted-foreground-dark">No image</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${event.status === "Upcoming" ? "bg-primary-light/90 dark:bg-primary-dark/90 text-white" : ""}
                          ${event.status === "Ongoing" ? "bg-accent-light/90 dark:bg-accent-dark/90 text-white" : ""}
                          ${event.status === "Completed" ? "bg-muted-light/90 dark:bg-muted-dark/90 text-foreground-light dark:text-foreground-dark" : ""}
                          ${event.status === "Cancelled" ? "bg-destructive-light/90 dark:bg-destructive-dark/90 text-white" : ""}
                        `}
                      >
                        {event.status || "Upcoming"}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h3 className="text-white text-xl font-bold truncate">{event.name}</h3>
                      <div className="flex items-center text-white/90 text-sm">
                        <MapPin size={14} className="mr-1" />
                        <span className="truncate">{event.location?.city || "Location"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                        <Calendar size={16} className="mr-1" />
                        <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span
                          className={`
                            px-2 py-1 rounded-full text-xs
                            ${event.difficulty === "Beginner" ? "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark" : ""}
                            ${event.difficulty === "Intermediate" ? "bg-accent-light/20 dark:bg-accent-dark/20 text-accent-light dark:text-accent-dark" : ""}
                            ${event.difficulty === "Advanced" ? "bg-destructive-light/20 dark:bg-destructive-dark/20 text-destructive-light dark:text-destructive-dark" : ""}
                          `}
                        >
                          {event.difficulty || "All Levels"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                        <Users size={16} className="mr-1" />
                        <span>
                          {event.participants?.length || 0}/{event.maxParticipants || "∞"}
                        </span>
                      </div>
                      {event.ratings && event.ratings.length > 0 && (
                        <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                          <Star size={16} className="mr-1 text-accent-light dark:text-accent-dark" />
                          <span>
                            {(event.ratings.reduce((acc, curr) => acc + curr.rating, 0) / event.ratings.length).toFixed(
                              1,
                            )}
                          </span>
                          <span className="ml-1">({event.ratings.length})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card-light dark:bg-card-dark rounded-lg shadow">
              <Trophy className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                No upcoming events
              </h3>
              <p className="text-muted-foreground-light dark:text-muted-foreground-dark max-w-md mx-auto mb-6">
                There are no upcoming events at the moment. Why not create one and invite others to join?
              </p>
              <Link
                to="/events/create"
                className="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-md hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors inline-block"
              >
                Create Event
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted-light/30 dark:bg-muted-dark/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground-light dark:text-foreground-dark mb-4">
              Why Choose SportsBuddy?
            </h2>
            <p className="text-muted-foreground-light dark:text-muted-foreground-dark max-w-2xl mx-auto">
              Our platform offers everything you need to connect with fellow sports enthusiasts and organize memorable
              events.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-card-light dark:bg-card-dark rounded-lg p-6 shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground-light dark:text-muted-foreground-dark">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-background-light dark:bg-background-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground-light dark:text-foreground-dark mb-4">
              What Our Users Say
            </h2>
            <p className="text-muted-foreground-light dark:text-muted-foreground-dark max-w-2xl mx-auto">
              Join thousands of satisfied users who have found their perfect sports community with SportsBuddy.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="bg-card-light dark:bg-card-dark rounded-lg p-6 shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={`${i < testimonial.rating
                          ? "text-accent-light dark:text-accent-dark fill-accent-light dark:fill-accent-dark"
                          : "text-muted-foreground-light dark:text-muted-foreground-dark"
                        }`}
                    />
                  ))}
                </div>
                <p className="text-foreground-light dark:text-foreground-dark mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground-light dark:text-foreground-dark">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-light to-accent-light dark:from-primary-dark dark:to-accent-dark">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Find Your Sports Community?</h2>
          <p className="text-white/90 max-w-2xl mx-auto mb-8 text-lg">
            Join SportsBuddy today and connect with thousands of sports enthusiasts in your area. Create events, join
            teams, and make new friends!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-primary-light dark:text-primary-dark font-semibold rounded-md hover:bg-white/90 transition-colors text-lg"
            >
              Sign Up Free
            </Link>
            <Link
              to="/events"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-md hover:bg-white/10 transition-colors text-lg"
            >
              Explore Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
