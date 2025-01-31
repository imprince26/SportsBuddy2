import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AlertTriangleIcon, HomeIcon, RefreshCwIcon } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  const BackgroundElements = () => (
    <>
      {[...Array(10)].map((_, index) => (
        <motion.div
          key={index}
          className="absolute bg-[#4CAF50]/10 rounded-full"
          style={{
            width: `${Math.random() * 100 + 50}px`,
            height: `${Math.random() * 100 + 50}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: Math.random() * 5 + 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </>
  );

  const illustrationVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
      rotate: -10,
    },
    animate: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
      },
    },
    hover: {
      scale: 1.05,
      rotate: 5,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1A1A] via-[#0F2C2C] to-[#0A1A1A] text-[#E0F2F1] relative overflow-hidden">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <BackgroundElements />
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 pt-24 pb-16 relative z-10 min-h-[calc(100vh-200px)] flex items-center justify-center"
      >
        <div className="text-center max-w-2xl">
          <motion.div
            variants={illustrationVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <AlertTriangleIcon
                className="text-[#4CAF50] mx-auto"
                size={150}
                strokeWidth={1.5}
              />
              <div className="absolute inset-0 bg-[#4CAF50]/20 rounded-full animate-ping"></div>
            </div>
          </motion.div>

          {/* Error Message */}
          <h1 className="text-6xl font-bold text-[#4CAF50] mb-6 tracking-tight">
            404
          </h1>
          <h2 className="text-3xl font-semibold text-[#81C784] mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-xl text-[#B2DFDB] mb-8 px-4">
            The page you are looking for seems to have wandered off into the
            sporting wilderness. Let's get you back on track!
          </p>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => navigate("/")}
              className="bg-[#4CAF50] hover:bg-[#388E3C] group"
            >
              <HomeIcon className="mr-2 group-hover:animate-bounce" />
              Return Home
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-[#4CAF50] bg-transparent text-[#4CAF50]  hover:bg-[#4CAF50]/10 hover:text-[#4CAF50] group"
            >
              <RefreshCwIcon className="mr-2 group-hover:animate-spin" />
              Reload Page
            </Button>
          </div>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default NotFound;
