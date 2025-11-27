import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Trophy, Users, TrendingUp, Sparkles, Zap, Calendar, MapPin } from 'lucide-react'
import { IoFootballOutline } from "react-icons/io5";
import { FaBasketball } from "react-icons/fa6";
import { FaTableTennis, FaRunning } from "react-icons/fa";

const CategoriesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const categories = [
    {
      id: 'Football',
      name: 'Football',
      icon: IoFootballOutline,
      participants: '2.5K+',
      events: '450+',
      description: 'Join the world\'s most popular sport',
    },
    {
      id: 'Basketball',
      name: 'Basketball',
      icon: FaBasketball,
      participants: '1.8K+',
      events: '320+',
      description: 'Dribble your way to new friendships',
    },
    {
      id: 'Tennis',
      name: 'Tennis',
      icon: FaTableTennis,
      participants: '1.2K+',
      events: '280+',
      description: 'Serve up some competitive fun',
    },
    {
      id: 'Running',
      name: 'Running',
      icon: FaRunning,
      participants: '3.2K+',
      events: '520+',
      description: 'Run towards your fitness goals',
    },
  ]

  return (
    <section className='py-24 bg-background border-t border-border relative overflow-hidden'>

      <div className='container mx-auto px-4'>
        <div className='flex flex-col md:flex-row justify-between items-end mb-12 gap-6'>
          <div className='max-w-2xl'>
            <div className='flex items-center gap-2 text-primary font-medium mb-4'>
              <Sparkles className='w-4 h-4' />
              <span className='text-sm uppercase tracking-wider'>Explore Categories</span>
            </div>
            <h2 className='text-3xl md:text-4xl font-bold font-heading text-foreground mb-4'>
              Popular Sports Categories
            </h2>
            <p className='text-muted-foreground text-lg'>
              Discover events across a wide range of sports and activities. Find your passion and connect with others.
            </p>
          </div>
          <Link to='/events' className='hidden md:flex items-center gap-2 text-foreground font-medium hover:text-primary transition-colors group'>
            View all categories <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
          </Link>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/events?category=${category.id}`}
              onClick={() => setSelectedCategory(category.id)}
              className='group block p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300'
            >
              <div className='flex justify-between items-start mb-6'>
                < category.icon className='w-8 h-8 text-primary group-hover:text-primary/80 transition-colors' />
                <div className='p-2 rounded-full bg-secondary border border-border group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300'>
                  <ArrowRight className='w-4 h-4 text-muted-foreground group-hover:text-white' />
                </div>
              </div>

              <h3 className='text-xl font-bold font-heading text-foreground mb-2 group-hover:text-primary transition-colors'>
                {category.name}
              </h3>
              <p className='text-sm text-muted-foreground mb-6 line-clamp-2'>
                {category.description}
              </p>

              <div className='flex items-center gap-4 pt-4 border-t border-border'>
                <div className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
                  <Users className='w-3.5 h-3.5' />
                  {category.participants}
                </div>
                <div className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
                  <Calendar className='w-3.5 h-3.5' />
                  {category.events}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className='mt-12 p-8 rounded-2xl bg-card border border-border relative overflow-hidden group hover:border-primary/30 transition-colors'>
          <div className='absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none' />

          <div className='relative z-10 flex flex-col md:flex-row items-center justify-between gap-8'>
            <div className='flex items-center gap-6'>
              <div className='w-14 h-14 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors'>
                <Zap className='w-7 h-7 text-primary' />
              </div>
              <div>
                <h3 className='text-xl font-bold font-heading text-foreground mb-1'>Can't find your sport?</h3>
                <p className='text-muted-foreground'>Create a custom event for any activity you love.</p>
              </div>
            </div>
            <Link to='/events/create'>
              <button className='px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5'>
                Create Custom Event
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CategoriesSection