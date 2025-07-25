import { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import SportsBuddyLoader from './components/Loader';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/layout/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import PublicProfile from './pages/PublicProfile';
import Search from './pages/Search';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

// Protected User Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import EventChat from './pages/EventChat';
import TeamManagement from './pages/TeamManagement';
import FollowersFollowing from './pages/FollowerFollowing';
// import Venues from './pages/Venues';
// import VenueDetails from './pages/VenueDetails';
// import Leaderboard from './pages/Leaderboard';
// import Community from './pages/Community';
// import Athletes from './pages/Athletes';
// import MyEvents from './pages/MyEvents';
// import Bookmarks from './pages/Bookmarks';
import Help from './pages/Help';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageEvents from './pages/admin/ManageEvents';
// import ManageVenues from './pages/admin/ManageVenues';
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
const ProtectedRoute = ({ children, adminOnly = false, title = "" }) => {
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (title) {
      document.title = `${title} - SportsBuddy`;
    }
  }, [title]);

  if (loading) {
    return <PageLoader message={`Loading ${title || 'page'}...`} />;
  }

  if (!isAuthenticated) {
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
const PublicRoute = ({ children, title = "" }) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} - SportsBuddy`;
    }
  }, [title]);

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
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route
              index
              element={
                <PublicRoute title="Home">
                  <Home />
                </PublicRoute>
              }
            />

            <Route
              path="login"
              element={
                <PublicRoute title="Login">
                  <Login />
                </PublicRoute>
              }
            />

            <Route
              path="register"
              element={
                <PublicRoute title="Register">
                  <Register />
                </PublicRoute>
              }
            />

            <Route
              path="events"
              element={
                <PublicRoute title="Events">
                  <Events />
                </PublicRoute>
              }
            />

            <Route
              path="events/:id"
              element={
                <PublicRoute title="Event Details">
                  <EventDetails />
                </PublicRoute>
              }
            />

            <Route
              path="profile/:userId"
              element={
                <PublicRoute title="Profile">
                  <PublicProfile />
                </PublicRoute>
              }
            />

            <Route
              path="search"
              element={
                <PublicRoute title="Search">
                  <Search />
                </PublicRoute>
              }
            />

            {/* <Route 
              path="venues" 
              element={
                <PublicRoute title="Sports Venues">
                  <Venues />
                </PublicRoute>
              } 
            />
            
            <Route 
              path="venues/:id" 
              element={
                <PublicRoute title="Venue Details">
                  <VenueDetails />
                </PublicRoute>
              } 
            />
            
            <Route 
              path="athletes" 
              element={
                <PublicRoute title="Athletes">
                  <Athletes />
                </PublicRoute>
              } 
            />
            
            <Route 
              path="leaderboard" 
              element={
                <PublicRoute title="Leaderboard">
                  <Leaderboard />
                </PublicRoute>
              } 
            />
            
            <Route 
              path="community" 
              element={
                <PublicRoute title="Community">
                  <Community />
                </PublicRoute>
              } 
            /> */}

            <Route
              path="about"
              element={
                <PublicRoute title="About Us">
                  <About />
                </PublicRoute>
              }
            />

            <Route
              path="contact"
              element={
                <PublicRoute title="Contact Us">
                  <Contact />
                </PublicRoute>
              }
            />

            <Route
              path="privacy"
              element={
                <PublicRoute title="Privacy Policy">
                  <Privacy />
                </PublicRoute>
              }
            />

            <Route
              path="terms"
              element={
                <PublicRoute title="Terms of Service">
                  <Terms />
                </PublicRoute>
              }
            />

            <Route
              path="help"
              element={
                <PublicRoute title="Help Center">
                  <Help />
                </PublicRoute>
              }
            />

            {/* Protected User Routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute title="Dashboard">
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="events/create"
              element={
                <ProtectedRoute title="Create Event">
                  <CreateEvent />
                </ProtectedRoute>
              }
            />

            <Route
              path="events/edit/:id"
              element={
                <ProtectedRoute title="Edit Event">
                  <EditEvent />
                </ProtectedRoute>
              }
            />

            {/* <Route
              path="my-events"
              element={
                <ProtectedRoute title="My Events">
                  <MyEvents />
                </ProtectedRoute>
              }
            /> */}

            <Route
              path="profile"
              element={
                <ProtectedRoute title="My Profile">
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="notifications"
              element={
                <ProtectedRoute title="Notifications">
                  <Notifications />
                </ProtectedRoute>
              }
            />

            <Route
              path="settings"
              element={
                <ProtectedRoute title="Settings">
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* <Route
              path="bookmarks"
              element={
                <ProtectedRoute title="Bookmarks">
                  <Bookmarks />
                </ProtectedRoute>
              }
            /> */}

            <Route
              path="chat/:eventId"
              element={
                <ProtectedRoute title="Event Chat">
                  <EventChat />
                </ProtectedRoute>
              }
            />

            <Route
              path="events/:eventId/teams"
              element={
                <ProtectedRoute title="Team Management">
                  <TeamManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="events/:eventId/teams/:teamId"
              element={
                <ProtectedRoute title="Team Details">
                  <TeamManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="users/:id/followers"
              element={
                <ProtectedRoute title="Followers">
                  <FollowersFollowing type="followers" />
                </ProtectedRoute>
              }
            />

            <Route
              path="users/:id/following"
              element={
                <ProtectedRoute title="Following">
                  <FollowersFollowing type="following" />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              path="dashboard"
              element={
                <ProtectedRoute adminOnly title="Admin Dashboard">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="users"
              element={
                <ProtectedRoute adminOnly title="Manage Users">
                  <ManageUsers />
                </ProtectedRoute>
              }
            />

            <Route
              path="events"
              element={
                <ProtectedRoute adminOnly title="Manage Events">
                  <ManageEvents />
                </ProtectedRoute>
              }
            />

            {/* <Route
              path="venues"
              element={
                <ProtectedRoute adminOnly title="Manage Venues">
                  <ManageVenues />
                </ProtectedRoute>
              }
            /> */}

            <Route
              path="notifications"
              element={
                <ProtectedRoute adminOnly title="Admin Notifications">
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="search"
              element={
                <ProtectedRoute adminOnly title="Admin Search">
                  <AdminSearch />
                </ProtectedRoute>
              }
            />

            <Route
              path="messages"
              element={
                <ProtectedRoute adminOnly title="Admin Messages">
                  <AdminMessages />
                </ProtectedRoute>
              }
            />

            <Route
              path="analytics"
              element={
                <ProtectedRoute adminOnly title="Analytics">
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />

            {/* <Route
              path="reports"
              element={
                <ProtectedRoute adminOnly title="Reports">
                  <AdminReports />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="moderation"
              element={
                <ProtectedRoute adminOnly title="Content Moderation">
                  <ContentModeration />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="logs"
              element={
                <ProtectedRoute adminOnly title="System Logs">
                  <SystemLogs />
                </ProtectedRoute>
              }
            /> */}

            <Route
              path="settings"
              element={
                <ProtectedRoute adminOnly title="Admin Settings">
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback Route */}
          <Route
            path="*"
            element={
              <PublicRoute title="Page Not Found">
                <NotFound />
              </PublicRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;
