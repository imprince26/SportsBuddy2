/* eslint-disable react/prop-types */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CalendarIcon, UsersIcon, TrendingUpIcon } from "lucide-react";

const UserStatistics = ({ events }) => {
  const totalEvents = events.length;
  const upcomingEvents = events.filter(
    (event) => new Date(event.date) > new Date()
  ).length;
  const participationRate = Math.round(
    (events.filter((event) => event.participants.length > 0).length /
      totalEvents) *
      100
  );

  const chartData = [
    { name: "Total Events", value: totalEvents },
    { name: "Upcoming Events", value: upcomingEvents },
    { name: "Participation Rate", value: participationRate },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-[#4CAF50]">Statistics</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Events Card */}
        <div className="bg-[#1D4E4E]/30 p-6 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="bg-[#4CAF50]/20 p-3 rounded-full">
              <CalendarIcon className="h-6 w-6 text-[#4CAF50]" />
            </div>
            <div>
              <p className="text-[#81C784]">Total Events</p>
              <p className="text-2xl font-bold text-[#4CAF50]">{totalEvents}</p>
            </div>
          </div>
        </div>

        {/* Upcoming Events Card */}
        <div className="bg-[#1D4E4E]/30 p-6 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="bg-[#4CAF50]/20 p-3 rounded-full">
              <TrendingUpIcon className="h-6 w-6 text-[#4CAF50]" />
            </div>
            <div>
              <p className="text-[#81C784]">Upcoming Events</p>
              <p className="text-2xl font-bold text-[#4CAF50]">
                {upcomingEvents}
              </p>
            </div>
          </div>
        </div>

        {/* Participation Rate Card */}
        <div className="bg-[#1D4E4E]/30  p-6 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="bg-[#4CAF50]/20 p-3 rounded-full">
              <UsersIcon className="h-6 w-6 text-[#4CAF50]" />
            </div>
            <div>
              <p className="text-[#81C784]">Participation Rate</p>
              <p className="text-2xl font-bold text-[#4CAF50]">
                {participationRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-[#1D4E4E]/30 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-[#81C784] mb-4">
          Event Statistics Overview
        </h3>
        <ResponsiveContainer width="100%" height={300} >
          <BarChart data={chartData} >
            <XAxis dataKey="name"  stroke="#81C784"  tick={{ fill: "#81C784" }} />
            <YAxis stroke="#81C784" tick={{ fill: "#81C784" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F2C2C",
                border: "1px solid #4CAF50",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" fill="#4CAF50" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserStatistics;
