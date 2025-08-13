import { useEffect } from "react"
import HeroSection from "@/components/home/HeroSection";
import CTASection from "@/components/home/CallToAction";
import CategoriesSection from "@/components/home/CategoriesSection";
import Testimonials from "@/components/home/Testimonials";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import FeaturesSection from "@/components/home/FeaturesSection";

const Home = () => {

  // page title
  useEffect(() => {
    document.title = "Home - SportsBuddy"
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      {/* Categories Section */}
      <CategoriesSection />

      {/* Upcoming Events Section */}
      <UpcomingEvents />

      {/* Features Section */}
      <FeaturesSection />

      {/* Testimonials Section */}
      <Testimonials />

      <CTASection />
    </div>
  )
}

export default Home