import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const CategoriesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("all")

    const categories = [
    { id: "Football", name: "Football", icon: "⚽", gradient: "from-green-400 to-blue-500" },
    { id: "Basketball", name: "Basketball", icon: "🏀", gradient: "from-orange-400 to-red-500" },
    { id: "Tennis", name: "Tennis", icon: "🎾", gradient: "from-yellow-400 to-green-500" },
    { id: "Running", name: "Running", icon: "🏃", gradient: "from-blue-400 to-purple-500" },
    { id: "Cycling", name: "Cycling", icon: "🚴", gradient: "from-green-400 to-teal-500" },
    { id: "Swimming", name: "Swimming", icon: "🏊", gradient: "from-cyan-400 to-blue-500" },
    { id: "Volleyball", name: "Volleyball", icon: "🏐", gradient: "from-pink-400 to-red-500" },
    { id: "Cricket", name: "Cricket", icon: "🏏", gradient: "from-indigo-400 to-purple-500" },
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
              Popular Sports Categories
            </h2>
            <p className="text-xl text-muted-foreground-light dark:text-muted-foreground-dark max-w-3xl mx-auto">
              Discover events across a wide range of sports and activities. Find your passion and connect with others
              who share it.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/events?category=${category.id}`}
                  className="group block"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="relative p-8 rounded-2xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-105">
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <div className="relative z-10 text-center">
                      <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                        {category.icon}
                      </div>
                      <h3 className="font-semibold text-foreground-light dark:text-foreground-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
  )
}

export default CategoriesSection
