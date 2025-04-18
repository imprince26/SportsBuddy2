import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Users, Calendar, MessageSquare, TrendingUp, Activity, Map, Award, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
    totalMessages: 0,
    newUsersToday: 0,
    newEventsToday: 0,
    popularCategories: [],
    recentReports: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/stats`);
        
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [API_URL]);
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Error Loading Dashboard</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</h2>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                +{stats.newUsersToday} today
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Events</h2>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEvents}</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                +{stats.newEventsToday} today
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Events</h2>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeEvents}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {((stats.activeEvents / stats.totalEvents) * 100).toFixed(1)}% of total
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900">
              <MessageSquare className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Messages</h2>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMessages}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Popular Categories */}
      <div className="mb-8">
        <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white">
          <Award className="mr-2 h-5 w-5" />
          Popular Categories
        </h2>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.popularCategories.map((category, index) => (
              <div key={index} className="flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.name}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{category.count}</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div 
                    className="h-full rounded-full bg-blue-600 dark:bg-blue-500" 
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recent Reports */}
      <div>
        <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Recent Reports
        </h2>
        
        {stats.recentReports.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Award className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Reports</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              There are no reported issues at this time.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Reported By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {stats.recentReports.map((report) => (
                  <tr key={report._id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        report.type === 'user' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {report.type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {report.reportedBy.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {report.description.length > 50 
                        ? `${report.description.substring(0, 50)}...` 
                        : report.description}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        report.status === 'resolved' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : report.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          to="/admin/users"
          className="flex items-center rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <Users className="mr-2 h-4 w-4" />
          Manage Users
        </Link>
        <Link
          to="/admin/events"
          className="flex items-center rounded-md bg-purple-600 py-2 px-4 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Manage Events
        </Link>
        <Link
          to="/admin/search"
          className="flex items-center rounded-md bg-green-600 py-2 px-4 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
        >
          <Map className="mr-2 h-4 w-4" />
          Advanced Search
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
