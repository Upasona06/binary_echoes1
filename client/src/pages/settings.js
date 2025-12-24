import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { User, Wallet, DollarSign, Save, AlertCircle, Bell, Clock } from 'lucide-react';
import { 
  areNotificationsEnabled, 
  initNotifications, 
  getReminderTime, 
  setReminderTime as saveReminderTime,
  sendNotification
} from '@/lib/notifications';

const CATEGORIES = ['food', 'travel', 'bills', 'subscriptions', 'others'];

export default function Settings() {
  const router = useRouter();
  const { user, loading: authLoading, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTimeState] = useState('20:00');
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });

  const [budgetData, setBudgetData] = useState({
    monthlyAllowance: 0,
    categoryBudgets: {
      food: 0,
      travel: 0,
      bills: 0,
      subscriptions: 0,
      others: 0
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Initialize notification settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNotificationsEnabled(areNotificationsEnabled());
      setReminderTimeState(getReminderTime());
    }
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      });
      setBudgetData({
        monthlyAllowance: user.monthlyAllowance || 0,
        categoryBudgets: user.categoryBudgets || {
          food: 0,
          travel: 0,
          bills: 0,
          subscriptions: 0,
          others: 0
        }
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      await api.put('/auth/update-profile', profileData);
      await checkAuth();
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      await api.put('/auth/update-budget', budgetData);
      await checkAuth();
      
      setMessage({ type: 'success', text: 'Budget settings updated successfully!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update budget' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle enabling notifications
  const handleEnableNotifications = async () => {
    const enabled = await initNotifications();
    setNotificationsEnabled(enabled);
    
    if (enabled) {
      sendNotification('🔔 Notifications Enabled!', {
        body: 'You\'ll now receive daily expense reminders.',
        icon: '/favicon.ico'
      });
      setMessage({ type: 'success', text: 'Notifications enabled successfully!' });
    } else {
      setMessage({ type: 'error', text: 'Could not enable notifications. Please check your browser settings.' });
    }
  };

  // Handle reminder time change
  const handleReminderTimeChange = (e) => {
    const newTime = e.target.value;
    setReminderTimeState(newTime);
    saveReminderTime(newTime);
    setMessage({ type: 'success', text: `Reminder time set to ${newTime}` });
  };

  // Test notification
  const handleTestNotification = () => {
    if (notificationsEnabled) {
      sendNotification('🧪 Test Notification', {
        body: 'This is a test notification from SpendSense!',
        icon: '/favicon.ico'
      });
    }
  };

  const totalCategoryBudget = Object.values(budgetData.categoryBudgets).reduce((sum, val) => sum + Number(val), 0);
  const budgetMismatch = totalCategoryBudget > budgetData.monthlyAllowance;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account and budget preferences
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`px-4 py-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Profile Information
            </h2>
          </div>
          
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Budget Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Wallet className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Budget Settings
            </h2>
          </div>
          
          <form onSubmit={handleBudgetUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monthly Allowance (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={budgetData.monthlyAllowance}
                onChange={(e) => setBudgetData({ ...budgetData, monthlyAllowance: parseFloat(e.target.value) || 0 })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Category Budgets (₹)
              </label>
              <div className="space-y-3">
                {CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center gap-3">
                    <label className="w-32 text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {category}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={budgetData.categoryBudgets[category]}
                      onChange={(e) => setBudgetData({
                        ...budgetData,
                        categoryBudgets: {
                          ...budgetData.categoryBudgets,
                          [category]: parseFloat(e.target.value) || 0
                        }
                      })}
                      className="input-field flex-1"
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Category Budget:</span>
                  <span className={`font-semibold ${budgetMismatch ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                    ₹{totalCategoryBudget.toFixed(2)}
                  </span>
                </div>
                {budgetMismatch && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    Category budgets exceed monthly allowance
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || budgetMismatch}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Budget Settings'}
            </button>
          </form>
        </div>

        {/* Password Change */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Change Password
            </h2>
          </div>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input-field"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input-field"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Notification Settings
            </h2>
          </div>
          
          <div className="space-y-5">
            {/* Notification Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Browser Notifications
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {notificationsEnabled 
                      ? 'You\'ll receive daily expense reminders' 
                      : 'Enable to get reminded to track expenses'}
                  </p>
                </div>
              </div>
              {!notificationsEnabled ? (
                <button
                  onClick={handleEnableNotifications}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Enable
                </button>
              ) : (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium rounded-full">
                  Enabled
                </span>
              )}
            </div>

            {/* Reminder Time Setting */}
            {notificationsEnabled && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Daily Reminder Time
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={handleReminderTimeChange}
                    className="input-field w-40"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You'll be reminded if no expenses are logged by this time
                  </p>
                </div>
              </div>
            )}

            {/* Test Notification */}
            {notificationsEnabled && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleTestNotification}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Send Test Notification
                </button>
              </div>
            )}

            {/* Browser Support Info */}
            {typeof window !== 'undefined' && !('Notification' in window) && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your browser doesn't support notifications
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
