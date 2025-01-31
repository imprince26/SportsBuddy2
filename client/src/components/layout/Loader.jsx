import { motion } from "framer-motion";

const SportsBuddyLoader = () => {
  return (
    <div className="fixed inset-0 bg-[#0A1A1A] flex items-center justify-center">
      <motion.div
        className="flex items-center space-x-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-16 h-16 bg-[#4CAF50] rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
            borderRadius: ["50%", "20%", "50%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <h2 className="text-3xl font-bold text-[#4CAF50]">Sports Buddy</h2>
      </motion.div>
    </div>
  );
};

export default SportsBuddyLoader;
