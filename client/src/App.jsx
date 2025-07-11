import { Routes, Route, Navigate } from 'react-router-dom';
import SportsBuddyLoader from './components/Loader';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Notifications from './pages/Notifications';
import Search from './pages/Search';
import EventChat from './pages/EventChat';
import ManageUsers from './pages/admin/ManageUsers';
import ManageEvents from './pages/admin/ManageEvents';
import ManageNotifications from './pages/admin/ManageNotifications';
import NotFound from './pages/NotFound';
import AdminLayout from './components/layout/AdminLayout';
import Settings from './pages/Settings';
import FollowersFollowing from './pages/FollowerFollowing';
import TeamManagement from './pages/TeamManagement';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSearch from './pages/admin/AdminSearch';
import AdminMessages from './pages/admin/AdminMessages';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import NotificationsPage from './pages/admin/NotificationPage';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <SportsBuddyLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (

    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>

        <Route path="" element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetails />} />
        <Route path="profile/:userId" element={<PublicProfile />} />
        <Route path="search" element={<Search />} />
        {/* <Route path="/teams/:id" element={<TeamPage />} /> */}


        {/* Protected Routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/create"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/edit/:id"
          element={
            <ProtectedRoute>
              <EditEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:eventId"
          element={
            <ProtectedRoute>
              <EventChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="events/:eventId/teams"
          element={
            <ProtectedRoute>
              <TeamManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="users/:id/followers"
          element={
            <ProtectedRoute>
              <FollowersFollowing type="followers" />
            </ProtectedRoute>
          }
        />
        <Route
          path="users/:id/following"
          element={
            <ProtectedRoute>
              <FollowersFollowing type="following" />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path='/' element={<AdminLayout />}>

      {/* Admin Routes */}
          <Route 
          path='/admin/dashboard'
          element={
            <ProtectedRoute adminOnly>
                <AdminDashboard />
            </ProtectedRoute>
          }
          />

      <Route
        path="admin/users"
        element={
          <ProtectedRoute adminOnly>
            <ManageUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/events"
        element={
          <ProtectedRoute adminOnly>
            <ManageEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/notifications"
        element={
          <ProtectedRoute adminOnly>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
       path='admin/search'
        element={
            <ProtectedRoute adminOnly>
                <AdminSearch />
            </ProtectedRoute>
          }
      />
      <Route
        path="admin/messages"
        element={
          <ProtectedRoute adminOnly>
            <AdminMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/analytics"
        element={
          <ProtectedRoute adminOnly>
            <AdminAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/settings"
        element={
          <ProtectedRoute adminOnly>
            <AdminSettings />
          </ProtectedRoute>
        }
      />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>

  );
}

export default App;