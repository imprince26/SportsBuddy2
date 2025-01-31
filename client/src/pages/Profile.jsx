import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useEvents } from "@/context/EventContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import UserProfileCard from "@/components/dashboard/UserProfileCard";
import UserEventsList from "@/components/dashboard/UserEventsList";
import UserStatistics from "@/components/dashboard/UserStatistics";
import { UserIcon, CalendarIcon, BarChartIcon } from "lucide-react";
import { toast } from "react-hot-toast";

const Dashboard = () => {
  const { user } = useAuth();
  const { getUserEvents } = useEvents();
  const [userEvents, setUserEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);

  const fetchUserEvents = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const events = await getUserEvents();
      setUserEvents(events);
    } catch (error) {
      toast.error("Failed to fetch events", {
        style: {
          background: "#2C3E50",
          color: "#ECF0F1",
        },
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserEvents();
  }, []);

  const dashboardTabs = [
    {
      id: "profile",
      label: "Profile",
      icon: <UserIcon className="mr-2" />,
    },
    {
      id: "events",
      label: "My Events",
      icon: <CalendarIcon className="mr-2" />,
    },
    {
      id: "statistics",
      label: "Statistics",
      icon: <BarChartIcon className="mr-2" />,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <UserProfileCard user={user} />;
      case "events":
        return (
          <>
            <UserEventsList
              events={userEvents}
              loading={loading}
              onRefresh={fetchUserEvents}
            />
          </>
        );
      case "statistics":
        return <UserStatistics events={userEvents} />;
      default:
        return <UserProfileCard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1A1A] via-[#0F2C2C] to-[#0A1A1A] text-[#E0F2F1]">
      <Header />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="bg-[#0F2C2C]/50 rounded-xl p-6 h-fit">
            <h2 className="text-2xl font-bold text-[#4CAF50] mb-6">
              Dashboard
            </h2>
            <div className="space-y-2">
              {dashboardTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full text-left flex items-center p-3 rounded-md transition-all
                    ${
                      activeTab === tab.id
                        ? "bg-[#4CAF50]/20 text-[#4CAF50]"
                        : "text-[#81C784] hover:bg-[#4CAF50]/10"
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 bg-[#0F2C2C]/50 rounded-xl p-6">
            {renderTabContent()}
          </div>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default Dashboard;
