import {ChevronRight, Globe, Play, Rocket, Trophy, Users, Calendar} from 'lucide-react'
import {motion} from 'framer-motion'
import {Link} from 'react-router-dom'
import {useAuth} from '@/hooks/useAuth'

  const CTASection = () => {
    const { user } = useAuth()

    if (user) {
      return (
        <section className="py-24 bg-gradient-to-br from-primary-light to-accent-light dark:from-primary-dark dark:to-accent-dark relative overflow-hidden">
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Ready to Level Up Your Game?
                  </h2>
                  <p className="text-xl text-white/90 mb-8 leading-relaxed">
                    Create your next event and invite players to join. Build your sports community today 
                    and make every game an adventure!
                  </p>
                  <Link
                    to="/events/create"
                    className="group inline-flex items-center px-8 py-4 bg-white text-primary-light dark:text-primary-dark font-semibold rounded-2xl hover:bg-white/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Create Event
                    <ChevronRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="grid grid-cols-2 gap-4"
                >
                  {[
                    { icon: Trophy, label: 'Host Events', color: 'from-yellow-400 to-orange-500' },
                    { icon: Users, label: 'Build Teams', color: 'from-blue-400 to-purple-500' },
                    { icon: Calendar, label: 'Track Progress', color: 'from-green-400 to-teal-500' },
                    { icon: Rocket, label: 'Grow Community', color: 'from-pink-400 to-red-500' }
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 group cursor-pointer"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-white font-medium">{item.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      )
    }

    return (
      <section className="py-24 bg-gradient-to-br from-primary-light to-accent-light dark:from-primary-dark dark:to-accent-dark relative overflow-hidden">
        {/* <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M20 20c0 11-9 20-20 20s-20-9-20-20 9-20 20-20 20 9 20 20zm-10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z"/%3E%3C/g%3E%3C/svg%3E')]"></div> */}
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Ready to Find Your Sports Community?
            </h2>
            <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
              Join SportsBuddy today and connect with thousands of sports enthusiasts in your area.
              Start your journey to a more active lifestyle!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                to="/register"
                className="group relative px-10 py-5 bg-white text-primary-light dark:text-primary-dark font-semibold rounded-2xl hover:bg-white/90 transition-all duration-300 inline-flex items-center justify-center shadow-2xl hover:shadow-white/25 hover:scale-105"
              >
                <Rocket className="w-6 h-6 mr-3" />
                Get Started Free
                <ChevronRight className="ml-2 w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Link>
              <Link
                to="/about"
                className="group px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 inline-flex items-center justify-center"
              >
                <Globe className="w-6 h-6 mr-3" />
                Learn More
                <ChevronRight className="ml-2 w-6 h-6" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

export default CTASection
