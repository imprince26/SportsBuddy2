import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedSports from "@/components/home/FeaturedSports";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import CallToAction from "@/components/home/CallToAction";

import { CalendarIcon, UsersIcon, ActivityIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

const Home = () => {
  const navigate = useNavigate();

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0A1A1A] via-[#0F2C2C] to-[#0A1A1A] 
      text-[#E0F2F1] overflow-x-hidden relative"
    >
      {/* Background Gradient Overlay */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] 
        from-[#0F2C2C]/30 via-transparent to-[#0A1A1A]/50 opacity-75 pointer-events-none"
      />

      <Header />

      <main className="pt-20 relative z-10">
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
        >
          <HeroSection />
        </motion.section>

        {/* Featured Sports Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
        >
          <FeaturedSports />
        </motion.section>

        {/* Upcoming Events Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
        >
          <UpcomingEvents />
        </motion.section>

        {/* Quick Action Buttons */}
        <motion.section
          className="container mx-auto px-4 py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
        >
          <div className="grid md:grid-cols-3 gap-6">
            <div
              className="bg-[#0F2C2C]/50 rounded-xl p-6 text-center 
              hover:bg-[#0F2C2C]/70 transition-all duration-300 
              transform hover:-translate-y-2 hover:shadow-lg"
            >
              <CalendarIcon className="mx-auto mb-4 text-[#4CAF50]" size={48} />
              <h3 className="text-xl font-semibold mb-4">Explore Events</h3>
              <Button
                onClick={() => navigate("/events")}
                className="w-full border bg-transparent border-[#4CAF50] text-[#4CAF50] hover:text-[#388E3C] hover:bg-[#4CAF50]/10"
              >
                View All Events
              </Button>
            </div>

            <div
              className="bg-[#0F2C2C]/50 rounded-xl p-6 text-center 
              hover:bg-[#0F2C2C]/70 transition-all duration-300 
              transform hover:-translate-y-2 hover:shadow-lg"
            >
              <UsersIcon className="mx-auto mb-4 text-[#4CAF50]" size={48} />
              <h3 className="text-xl font-semibold mb-4">Join Community</h3>
              <Button
                onClick={() => navigate("/register")}
                variant="outline"
                className="w-full bg-transparent border-[#4CAF50] text-[#4CAF50] hover:text-[#388E3C] hover:bg-[#4CAF50]/10"
              >
                Sign Up
              </Button>
            </div>

            <div
              className="bg-[#0F2C2C]/50 rounded-xl p-6 text-center 
              hover:bg-[#0F2C2C]/70 transition-all duration-300 
              transform hover:-translate-y-2 hover:shadow-lg"
            >
              <ActivityIcon className="mx-auto mb-4 text-[#4CAF50]" size={48} />
              <h3 className="text-xl font-semibold mb-4">Create Event</h3>
              <Button
                onClick={() => navigate("/events/create")}
                className="w-full border bg-transparent border-[#4CAF50] text-[#4CAF50] hover:text-[#388E3C] hover:bg-[#4CAF50]/10"
              >
                Start New Event
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        <CallToAction />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
