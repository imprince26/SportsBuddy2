import { motion } from "framer-motion";
import { ActivityIcon, SearchIcon, PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const { user } = useAuth();
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
    <motion.div
      className="container mx-auto px-4 py-16 relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Background Gradient */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] 
        from-[#0F2C2C]/30 via-transparent to-[#0A1A1A]/50 opacity-75 pointer-events-none"
      ></div>

      <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div className="space-y-6" variants={itemVariants}>
          <motion.h1
            className="text-5xl font-bold text-[#E0F2F1] leading-tight"
            variants={itemVariants}
          >
            {user ? `Welcome Back, ${user.name}!` : "Connect. Play. Compete."}
          </motion.h1>

          <motion.p
            className="text-xl text-[#81C784] mb-6"
            variants={itemVariants}
          >
            Discover local sports events, find teammates, and elevate your
            athletic journey.
          </motion.p>

          <motion.div className="flex space-x-4" variants={itemVariants}>
            <Button
              onClick={() => navigate("/events")}
              className="bg-[#4CAF50] text-white hover:bg-[#388E3C] group"
            >
              <SearchIcon className="mr-2 group-hover:rotate-12 transition-transform" />
              Find Events
            </Button>
            <Button
              onClick={() => navigate("/events/create")}
              variant="outline"
              className="border-[#4CAF50] bg-transparent text-[#4CAF50] hover:text-[#388E3C] hover:bg-[#4CAF50]/10 group"
            >
              <PlusCircleIcon className="mr-2 group-hover:scale-110 transition-transform" />
              Create Event
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="hidden md:flex justify-center relative"
          variants={itemVariants}
        >
          <div className="absolute w-96 h-96 bg-[#2E7D32]/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{
                rotate: [0, 10, -10, 0],
                transition: {
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              <ActivityIcon
                className="h-72 w-72 text-[#4CAF50]/30 animate-pulse"
                strokeWidth={1}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
