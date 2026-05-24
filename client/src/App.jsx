/* eslint-disable react/prop-types */
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import SportsBuddyLoader from './components/Loader';
import { useAuth } from '@/hooks/useAuth';
import { useMetadata } from '@/hooks/useMetadata';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/layout/AdminLayout';
import { ThemeProvider } from '@/context/ThemeProvider';

import ScrollToTop from '@/components/ScrollToTop';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Events = lazy(() => import('./pages/event/Events'));
const EventDetails = lazy(() => import('./pages/event/EventDetails'));
const EventPayment = lazy(() => import('./pages/event/EventPayment'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const GlobalSearch = lazy(() => import('./pages/GlobalSearch'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Privacy = lazy(() => import('./pages/public/Privacy'));
const Terms = lazy(() => import('./pages/public/Terms'));
const Help = lazy(() => import('./pages/public/Help'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Venues = lazy(() => import('./pages/venues/Venues'));
const VenueDetails = lazy(() => import('./pages/venues/VenueDetails'));
const EditVenue = lazy(() => import('./pages/venues/EditVenue'));
const VenueBooking = lazy(() => import('./pages/venues/VenueBooking'));
const MyBookings = lazy(() => import('./pages/venues/MyBookings'));
const Leaderboard = lazy(() => import('./pages/leaderboard/Leaderboard'));
const Athletes = lazy(() => import('./pages/athletes/Athletes'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminCommunities = lazy(() => import('./pages/admin/AdminCommunities'));
const AdminVenues = lazy(() => import('./pages/admin/AdminVenues'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminEventPayments = lazy(() => import('./pages/admin/AdminEventPayments'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const CreateEvent = lazy(() => import('./pages/event/CreateEvent'));
const EditEvent = lazy(() => import('./pages/event/EditEvent'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const EventChat = lazy(() => import('./pages/event/EventChat'));
const TeamManagement = lazy(() => import('./pages/TeamManagement'));
const FollowersFollowing = lazy(() => import('./pages/FollowerFollowing'));
const Communities = lazy(() => import('./pages/community/Communities'));
const CreateCommunity = lazy(() => import('./pages/community/CreateCommunity'));
const EditCommunity = lazy(() => import('./pages/community/EditCommunity'));
const CommunityDetails = lazy(() => import('./pages/community/CommunityDetails'));
const ManageCommunity = lazy(() => import('./pages/community/ManageCommunity'));
const PostDetail = lazy(() => import('./pages/community/PostDetail'));



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
  const { loading: authLoading } = useAuth();

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
            <Route path="events/:id/payment" element={<ProtectedRoute><EventPayment /></ProtectedRoute>} />
            <Route path="profile/:userId" element={<PublicRoute><PublicProfile /></PublicRoute>} />
            <Route path="search" element={<PublicRoute><GlobalSearch /></PublicRoute>} />
            <Route path="venues" element={<PublicRoute><Venues /></PublicRoute>} />
            <Route path="venues/:id" element={<PublicRoute><VenueDetails /></PublicRoute>} />
            <Route path="venues/:id/book" element={<ProtectedRoute><VenueBooking /></ProtectedRoute>} />
            <Route path="venues/:id/edit" element={<ProtectedRoute><EditVenue /></ProtectedRoute>} />
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
          </Route>

          <Route
            path="/admin"
            element={
              <ThemeProvider defaultTheme="system" storageKey="sportsbuddy-theme">
                <ProtectedRoute adminOnly>
                  <AdminLayout />
                </ProtectedRoute>
              </ThemeProvider>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="analytics" element={<ProtectedRoute adminOnly><AdminAnalytics /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
            <Route path="events" element={<ProtectedRoute adminOnly><AdminEvents /></ProtectedRoute>} />
            <Route path="communities" element={<ProtectedRoute adminOnly><AdminCommunities /></ProtectedRoute>} />
            <Route path="venues" element={<ProtectedRoute adminOnly><AdminVenues /></ProtectedRoute>} />
            <Route path="bookings" element={<ProtectedRoute adminOnly><AdminBookings /></ProtectedRoute>} />
            <Route path="event-payments" element={<ProtectedRoute adminOnly><AdminEventPayments /></ProtectedRoute>} />
            <Route path="notifications" element={<ProtectedRoute adminOnly><AdminNotifications /></ProtectedRoute>} />
            <Route path="audit-logs" element={<ProtectedRoute adminOnly><AdminAuditLogs /></ProtectedRoute>} />
          </Route>

          

          {/* Fallback Route */}
          <Route path="*" element={<PublicRoute><NotFound /></PublicRoute>} />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;
