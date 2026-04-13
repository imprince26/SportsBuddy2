import AdminStatsCard from "@/components/admin/AdminStatsCard";

const AdminMetricGrid = ({ items = [] }) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <AdminStatsCard
          key={item.title}
          title={item.title}
          value={item.value}
          hint={item.hint}
          icon={item.icon}
          trend={item.trend}
        />
      ))}
    </div>
  );
};

export default AdminMetricGrid;
