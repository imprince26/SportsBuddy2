import { useEffect } from "react"
import HeroSection from "@/components/home/HeroSection";
import CTASection from "@/components/home/CallToAction";
import CategoriesSection from "@/components/home/CategoriesSection";
import Testimonials from "@/components/home/Testimonials";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import FeaturesSection from "@/components/home/FeaturesSection";
import SEO from "@/components/SEO/SEO";
import { generateOrganizationSchema } from "@/utils/schemaGenerator";

const Home = () => {

  // page title
  useEffect(() => {
    document.title = "Home - SportsBuddy"
  }, [])

  const schema = generateOrganizationSchema();

  return (
    <div className="flex flex-col min-h-screen">
        <SEO 
        title="Home" 
        description="Connect with athletes, discover sports events, and join sports communities with SportsBuddy." 
        keywords="sports, events, athletes, community, sports app"
        schema={schema}
      />
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