import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Bell, Lock, Save } from 'lucide-react';

const Settings = () => {
  const { user, updatePreferences, updatePassword } = useAuth();
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    radius: 10
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Load user preferences
  useEffect(() => {
    if (user && user.preferences) {
      setPreferences({
        emailNotifications: user.preferences.emailNotifications,
        pushNotifications: user.preferences.pushNotifications,
        radius: user.preferences.radius
      });
    }
  }, [user]);

  // Page Title
  useEffect(() => {
    document.title = 'Settings - SportsBuddy';
  }, []);
  
  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await updatePreferences(preferences);
      
      if (result.success) {
        toast.success('Preferences updated successfully');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    setPasswordLoading(true);
    
    try {
      const result = await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (result.success) {
        toast.success('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
    } finally {
      setPasswordLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Notification Preferences */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white">
            <Bell className="mr-2 h-5 w-5" />
            Notification Preferences
          </h2>
          
          <form onSubmit={handlePreferencesSubmit}>
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Notifications
                </label>
                <div className="relative inline-block w-10 select-none align-middle">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    id="emailNotifications"
                    checked={preferences.emailNotifications}
                    onChange={handlePreferenceChange}
                    className="sr-only"
                  />
                  <div className={`block h-6 w-10 rounded-full ${preferences.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${preferences.emailNotifications ? 'translate-x-4' : ''}`}></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receive email notifications about event updates and messages
              </p>
            </div>
            
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="pushNotifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Push Notifications
                </label>
                <div className="relative inline-block w-10 select-none align-middle">
                  <input
                    type="checkbox"
                    name="pushNotifications"
                    id="pushNotifications"
                    checked={preferences.pushNotifications}
                    onChange={handlePreferenceChange}
                    className="sr-only"
                  />
                  <div className={`block h-6 w-10 rounded-full ${preferences.pushNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${preferences.pushNotifications ? 'translate-x-4' : ''}`}></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receive browser notifications for real-time updates
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="radius" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Event Search Radius (km)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  name="radius"
                  id="radius"
                  min="1"
                  max="50"
                  value={preferences.radius}
                  onChange={handlePreferenceChange}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                />
                <span className="ml-2 w-10 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {preferences.radius}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Set the default radius for finding nearby events
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </form>
        </div>
        
        {/* Change Password */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white">
            <Lock className="mr-2 h-5 w-5" />
            Change Password
          </h2>
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label htmlFor="currentPassword" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="currentPassword"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`block w-full rounded-md border ${
                    errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                  } bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 sm:text-sm`}
                  placeholder="Enter your current password"
                />
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.currentPassword}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`block w-full rounded-md border ${
                    errors.newPassword ? 'border-red-300' : 'border-gray-300'
                  } bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 sm:text-sm`}
                  placeholder="Enter your new password"
                />
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`block w-full rounded-md border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 sm:text-sm`}
                  placeholder="Confirm your new password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex w-full items-center justify-center rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Save className="mr-2 h-4 w-4" />
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
