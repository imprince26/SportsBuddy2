import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RocketIcon, ArrowRightIcon, UsersIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CallToAction = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.section
      className="relative overflow-hidden py-16 bg-gradient-to-br from-[#0F2C2C] to-[#2E7D32]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      {/* Background Gradient Shapes */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#4CAF50]/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2E7D32]/30 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants}>
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-white mb-6 flex items-center justify-center gap-4"
              variants={itemVariants}
            >
              <RocketIcon className="text-[#4CAF50] animate-bounce" size={48} />
              Elevate Your Sports Journey
            </motion.h2>
          </motion.div>

          <motion.p
            className="text-xl text-[#B2DFDB] mb-8 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Connect with athletes, discover exciting events, and transform your
            sporting experience. Whether you're a beginner or a pro, there's a
            community waiting for you.
          </motion.p>

          <motion.div
            className="flex flex-col md:flex-row justify-center items-center gap-6"
            variants={itemVariants}
          >
            <Button
              onClick={() => navigate("/register")}
              className="bg-[#4CAF50] text-white hover:bg-[#388E3C] 
              transition-all duration-300 group flex items-center gap-2 
              px-8 py-3 text-lg"
              variants={itemVariants}
            >
              Get Started
              <ArrowRightIcon
                className="group-hover:translate-x-1 transition-transform"
                size={20}
              />
            </Button>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            className="mt-12 grid md:grid-cols-3 gap-6 text-center"
            variants={containerVariants}
          >
            {[
              {
                icon: "🏆",
                title: "Competitive Events",
                description: "Participate in local and regional tournaments",
              },
              {
                icon: "🤝",
                title: "Team Connections",
                description: "Find teammates and build lasting relationships",
              },
              {
                icon: "📊",
                title: "Performance Tracking",
                description: "Monitor your progress and achievements",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-[#0F2C2C]/50 p-6 rounded-xl hover:bg-[#0F2C2C]/70 
                transition-all duration-300 transform hover:-translate-y-2"
                variants={itemVariants}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.2,
                }}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-[#4CAF50] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#B2DFDB]">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default CallToAction;
