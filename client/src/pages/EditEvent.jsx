import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EditEventForm from "@/components/events/EditEventForm";

const EditEvent = () => {
  return (
    <div className="text-[#B2DFDB]">
      <Header />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-[#0A1A1A] via-[#0F2C2C] to-[#0A1A1A] py-16 px-4"
      >
        <EditEventForm />
      </motion.div>
      <Footer />
    </div>
  );
};

export default EditEvent;
