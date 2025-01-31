import { motion } from "framer-motion";

const featuredSports = [
  {
    name: "Cricket",
    icon: "🏏",
    description: "Find Cricket Events and local Matches ",
    color: "bg-blue-500/20",
  },
  {
    name: "Basketball",
    icon: "🏀",
    description: "Find pickup games and communities",
    color: "bg-orange-500/20",
  },
  {
    name: "Running",
    icon: "🏃",
    description: "Join running groups and track progress",
    color: "bg-green-500/20",
  },
  {
    name: " Football",
    icon: "⚽",
    description: "Connect with local football enthusiasts",
    color: "bg-red-500/20",
  },
];

const FeaturedSports = () => {
  return (
    <motion.section
      className="container mx-auto px-4 py-16"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <h2 className="text-3xl font-bold text-center text-[#E0F2F1] mb-12">
        Featured Sports
      </h2>

      <div className="grid md:grid-cols-4 gap-6">
        {featuredSports.map((sport) => (
          <motion.div
            key={sport.name}
            className={`${sport.color} rounded-xl p-6 text-center 
            hover:scale-105 transition-all duration-300 
            transform shadow-lg`}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{
              scale: 1.05,
              rotate: [0, 2, -2, 0],
              transition: { duration: 0.3 },
            }}
            viewport={{ once: true }}
          >
            <div className="text-6xl mb-4 animate-bounce">{sport.icon}</div>
            <h3 className="text-xl font-semibold text-[#4CAF50] mb-2">
              {sport.name}
            </h3>
            <p className="text-[#81C784]">{sport.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default FeaturedSports;
