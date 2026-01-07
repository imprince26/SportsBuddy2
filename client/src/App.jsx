/* eslint-disable react/prop-types */
import { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import SportsBuddyLoader from './components/Loader';
import { useAuth } from '@/hooks/useAuth';
import { useMetadata } from '@/hooks/useMetadata';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/layout/AdminLayout';
import ScrollToTop from '@/components/ScrollToTop';

// Public Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import ForgotPassword from './pages/auth/ForgotPassword';
import Events from './pages/event/Events';
import EventDetails from './pages/event/EventDetails';
import PublicProfile from './pages/PublicProfile';
import GlobalSearch from './pages/GlobalSearch';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';
import Help from './pages/public/Help';
import NotFound from './pages/NotFound';
import Venues from './pages/venues/Venues';
import VenueDetails from './pages/venues/VenueDetails';
import VenueBooking from './pages/venues/VenueBooking';
import MyBookings from './pages/venues/MyBookings';
import Leaderboard from './pages/leaderboard/Leaderboard';
// import Community from './pages/community/Community';
import Athletes from './pages/athletes/Athletes';

// Protected User Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateEvent from './pages/event/CreateEvent';
import EditEvent from './pages/event/EditEvent';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import EventChat from './pages/event/EventChat';
import TeamManagement from './pages/TeamManagement';
import FollowersFollowing from './pages/FollowerFollowing';
// import MyEvents from './pages/MyEvents';
// import Bookmarks from './pages/Bookmarks';
// import Community from './pages/community/Community';
import Communities from './pages/community/Communities';
import CreateCommunity from './pages/community/CreateCommunity';
import EditCommunity from './pages/community/EditCommunity';
import CommunityDetails from './pages/community/CommunityDetails';
import ManageCommunity from './pages/community/ManageCommunity';
import PostDetail from './pages/community/PostDetail';
// import CreateVenue from './pages/venue/CreateVenue';
// import EditVenue from './pages/venue/EditVenue';
// import UserProfile from './pages/UserProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageEvents from './pages/admin/ManageEvents';
import ManageCommunities from './pages/admin/ManageCommunities';
import AdminVenues from './pages/admin/AdminVenues';
import CreateVenue from './pages/admin/CreateVenue';
import EditVenue from './pages/admin/EditVenue';
import VenueBookings from './pages/admin/VenueBookings';
import AllVenueBookings from './pages/admin/AllVenueBookings';
import AdminSearch from './pages/admin/AdminSearch';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSettings from './pages/admin/AdminSettings';
import NotificationsPage from './pages/admin/NotificationPage';
import AdminAnalytics from './pages/admin/AdminAnalytics';
// import AdminReports from './pages/admin/AdminReports';
// import ContentModeration from './pages/admin/ContentModeration';
// import SystemLogs from './pages/admin/SystemLogs';

// Error Boundary Component
import ErrorBoundary from './components/ErrorBoundary';

// Loading Component with page-specific messages
const PageLoader = ({ message = "Loading amazing sports events..." }) => (
  <div className="fixed inset-0 z-50">
    <SportsBuddyLoader message={message} />
  </div>
);

// Enhanced Protected Route with loading states
const ProtectedRoute = ({ children, adminOnly = false, title = "", data = {} }) => {
  const { user, loading } = useAuth();

  // Use metadata hook for dynamic meta tags
  useMetadata(data);

  if (loading) {
    return <PageLoader message={`Loading ${title || 'page'}...`} />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Suspense fallback={<PageLoader message={`Loading ${title || 'content'}...`} />}>
      {children}
    </Suspense>
  );
};

// Public Route wrapper with loading
const PublicRoute = ({ children, title = "", data = {} }) => {
  // Use metadata hook for dynamic meta tags
  useMetadata(data);

  return (
    <Suspense fallback={<PageLoader message={`Loading ${title || 'page'}...`} />}>
      {children}
    </Suspense>
  );
};

function App() {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  // Show initial loader while auth is being checked
  if (authLoading) {
    return <PageLoader message="Initializing SportsBuddy..." />;
  }

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <ScrollToTop />
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<PublicRoute><Home /></PublicRoute>} />
            <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route path="events" element={<PublicRoute><Events /></PublicRoute>} />
            <Route path="events/:id" element={<PublicRoute><EventDetails /></PublicRoute>} />
            <Route path="profile/:userId" element={<PublicRoute><PublicProfile /></PublicRoute>} />
            <Route path="search" element={<PublicRoute><GlobalSearch /></PublicRoute>} />
            <Route path="venues" element={<PublicRoute><Venues /></PublicRoute>} />
            <Route path="venues/:id" element={<PublicRoute><VenueDetails /></PublicRoute>} />
            <Route path="venues/:id/book" element={<ProtectedRoute><VenueBooking /></ProtectedRoute>} />
            <Route path="my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="athletes" element={<PublicRoute><Athletes /></PublicRoute>} />
            <Route path="leaderboard" element={<PublicRoute><Leaderboard /></PublicRoute>} />
            <Route path="community" element={<PublicRoute><Communities /></PublicRoute>} />
            <Route path="community/:id" element={<PublicRoute><CommunityDetails /></PublicRoute>} />
            <Route path="community/post/:postId" element={<PublicRoute><PostDetail /></PublicRoute>} />
            <Route path="about" element={<PublicRoute><About /></PublicRoute>} />
            <Route path="contact" element={<PublicRoute><Contact /></PublicRoute>} />
            <Route path="privacy" element={<PublicRoute><Privacy /></PublicRoute>} />
            <Route path="terms" element={<PublicRoute><Terms /></PublicRoute>} />
            <Route path="help" element={<PublicRoute><Help /></PublicRoute>} />

            {/* Protected User Routes */}
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="events/create" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
            <Route path="events/:id/edit" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
            {/* <Route path="my-events" element={<ProtectedRoute title="My Events"><MyEvents /></ProtectedRoute>} /> */}
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            {/* <Route path="user/:id" element={<ProtectedRoute title="User Profile"><UserProfile /></ProtectedRoute>} /> */}
            <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            {/* <Route path="bookmarks" element={<ProtectedRoute title="Bookmarks"><Bookmarks /></ProtectedRoute>} /> */}
            <Route path="chat/:eventId" element={<ProtectedRoute><EventChat /></ProtectedRoute>} />
            <Route path="events/:eventId/teams" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
            <Route path="events/:eventId/teams/:teamId" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
            <Route path="users/:id/followers" element={<ProtectedRoute><FollowersFollowing type="followers" /></ProtectedRoute>} />
            <Route path="users/:id/following" element={<ProtectedRoute><FollowersFollowing type="following" /></ProtectedRoute>} />
            <Route path="community/create" element={<ProtectedRoute><CreateCommunity /></ProtectedRoute>} />
            <Route path="community/:id/edit" element={<ProtectedRoute><EditCommunity /></ProtectedRoute>} />
            <Route path="community/:id/manage" element={<ProtectedRoute><ManageCommunity /></ProtectedRoute>} />
            <Route path="venues/:id/edit" element={<ProtectedRoute><EditVenue /></ProtectedRoute>} />
          </Route>

          {/* Admin Routes */}
          <Route path="admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>} />
            <Route path="events" element={<ProtectedRoute adminOnly><ManageEvents /></ProtectedRoute>} />
            <Route path="communities" element={<ProtectedRoute adminOnly><ManageCommunities /></ProtectedRoute>} />
            <Route path="venues" element={<ProtectedRoute adminOnly><AdminVenues /></ProtectedRoute>} />
            <Route path="venues/:id/bookings" element={<ProtectedRoute adminOnly><VenueBookings /></ProtectedRoute>} />
            <Route path="venue-bookings" element={<ProtectedRoute adminOnly><AllVenueBookings /></ProtectedRoute>} />
            <Route path="create-venue" element={<ProtectedRoute adminOnly><CreateVenue /></ProtectedRoute>} />
            <Route path="edit-venue/:id" element={<ProtectedRoute adminOnly><EditVenue /></ProtectedRoute>} />
            <Route path="notifications" element={<ProtectedRoute adminOnly><NotificationsPage /></ProtectedRoute>} />
            <Route path="search" element={<ProtectedRoute adminOnly><AdminSearch /></ProtectedRoute>} />
            <Route path="messages" element={<ProtectedRoute adminOnly><AdminMessages /></ProtectedRoute>} />
            <Route path="analytics" element={<ProtectedRoute adminOnly><AdminAnalytics /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<PublicRoute><NotFound /></PublicRoute>} />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;
