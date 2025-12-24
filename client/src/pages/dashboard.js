import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/lib/axios';
import {
  initNotifications,
  hasExpensesToday,
  shouldSendReminder,
  sendExpenseReminder,
  isReminderTime,
  areNotificationsEnabled
} from '@/lib/notifications';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import OverviewCards from '@/components/Dashboard/OverviewCards';
import CategoryBreakdown from '@/components/Dashboard/CategoryBreakdown';
import DailySpendingChart from '@/components/Dashboard/DailySpendingChart';
import SpendingHeatmap from '@/components/Dashboard/SpendingHeatmap';
import BudgetThermometer from '@/components/Dashboard/BudgetThermometer';
import StreakTracker from '@/components/Dashboard/StreakTracker';
import BadgeDisplay from '@/components/Dashboard/BadgeDisplay';
import RecentExpenses from '@/components/Dashboard/RecentExpenses';
import AddExpenseModal from '@/components/Dashboard/AddExpenseModal';
import { Plus, TrendingUp, Receipt, Target, Sparkles, Bell } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  // Initialize notifications
  useEffect(() => {
    const setupNotifications = async () => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const enabled = areNotificationsEnabled();
        setNotificationsEnabled(enabled);
        
        // Show prompt if not yet decided
        if (Notification.permission === 'default') {
          setShowNotificationPrompt(true);
        }
      }
    };
    
    setupNotifications();
  }, []);

  // Check for expense reminders
  const checkExpenseReminder = useCallback(() => {
    if (!notificationsEnabled || !expenses) return;
    
    // Check if user hasn't added expenses today and it's reminder time (evening)
    const noExpensesToday = !hasExpensesToday(expenses);
    const shouldRemind = shouldSendReminder();
    const isEvening = isReminderTime();
    
    if (noExpensesToday && shouldRemind && isEvening) {
      sendExpenseReminder();
    }
  }, [expenses, notificationsEnabled]);

  // Set up periodic reminder check
  useEffect(() => {
    if (!notificationsEnabled) return;
    
    // Check immediately
    checkExpenseReminder();
    
    // Check every 15 minutes
    const intervalId = setInterval(checkExpenseReminder, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [checkExpenseReminder, notificationsEnabled]);

  // Enable notifications
  const enableNotifications = async () => {
    const enabled = await initNotifications();
    setNotificationsEnabled(enabled);
    setShowNotificationPrompt(false);
    
    if (enabled) {
      // Send a test notification
      new Notification('🎉 Notifications Enabled!', {
        body: 'You\'ll now receive reminders to track your expenses.',
        icon: '/favicon.ico'
      });
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, refreshKey]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const [analyticsRes, expensesRes] = await Promise.all([
        api.get(`/analytics/dashboard?month=${month}&year=${year}`),
        api.get(`/expenses?month=${month}&year=${year}`)
      ]);

      console.log('Analytics Response:', analyticsRes.data);
      console.log('Expenses Response:', expensesRes.data);

      setAnalytics(analyticsRes.data);
      setExpenses(expensesRes.data.expenses || []);
      
      // Fetch warnings separately as it might fail
      try {
        const warningsRes = await api.get('/budget/warnings');
        setWarnings(warningsRes.data.warnings || []);
      } catch (err) {
        console.log('Warnings not available:', err.message);
        setWarnings([]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = () => {
    setRefreshKey(prev => prev + 1);
    setShowAddExpense(false);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-200 dark:border-primary-800 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-primary-600 dark:border-primary-400 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-5xl">📊</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No Data Available Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            Start tracking your expenses to see insights, charts, and personalized recommendations.
          </p>
          <button
            onClick={() => setShowAddExpense(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Add Your First Expense
          </button>
          {showAddExpense && (
            <AddExpenseModal
              onClose={() => setShowAddExpense(false)}
              onSuccess={handleExpenseAdded}
            />
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header - Compact */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              Welcome, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Overview
            </p>
          </div>
          <button
            onClick={() => setShowAddExpense(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>

        {/* Quick Actions - Compact */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Add', icon: Plus, color: 'bg-primary-600', action: () => setShowAddExpense(true) },
            { label: 'Analytics', icon: TrendingUp, color: 'bg-violet-600', action: () => router.push('/analytics') },
            { label: 'Expenses', icon: Receipt, color: 'bg-orange-500', action: () => router.push('/expenses') },
            { label: 'Budget', icon: Target, color: 'bg-emerald-600', action: () => router.push('/settings') },
          ].map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className="flex flex-col items-center gap-1.5 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Notification Prompt Banner */}
        {showNotificationPrompt && (
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg animate-pulse">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg">
              <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                Enable Expense Reminders
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                Get notified if you forget to track your daily expenses
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNotificationPrompt(false)}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Later
              </button>
              <button
                onClick={enableNotifications}
                className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Enable
              </button>
            </div>
          </div>
        )}

        {/* Notification Status Indicator */}
        {notificationsEnabled && !hasExpensesToday(expenses) && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm text-amber-700 dark:text-amber-300">
              No expenses added today - you'll receive a reminder this evening!
            </span>
          </div>
        )}

        {/* Budget Setup Alert - Compact */}
        {analytics && analytics.overview && analytics.overview.allowance === 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-700 dark:text-blue-300 flex-1">
              Set up your monthly budget to start tracking.
            </p>
            <button
              onClick={() => router.push('/settings')}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Setup
            </button>
          </div>
        )}

        {/* Warnings - Compact */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            {warnings.map((warning, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm ${
                  warning.severity === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                    : warning.severity === 'high'
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300'
                }`}
              >
                <span>{warning.severity === 'critical' ? '🚨' : warning.severity === 'high' ? '⚠️' : '💡'}</span>
                <span>{warning.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Over Budget Alert - Compact */}
        {analytics && analytics.overview && analytics.overview.isOverBudget && analytics.overview.allowance > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
            <span className="text-xl">🚨</span>
            <div className="flex-1">
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                Over budget by ₹{(analytics.overview.totalSpent - analytics.overview.allowance).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => router.push('/expenses')}
              className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              Review →
            </button>
          </div>
        )}

        {/* Overview Cards */}
        {analytics && <OverviewCards analytics={analytics} />}

        {/* Main Grid - Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-4">
            {analytics && analytics.categoryData && <CategoryBreakdown categoryData={analytics.categoryData} />}
            {analytics && analytics.dailySpending && <DailySpendingChart dailyData={analytics.dailySpending} />}
            {analytics && analytics.heatmapData && <SpendingHeatmap heatmapData={analytics.heatmapData} />}
          </div>

          {/* Right Column - Progress */}
          <div className="space-y-4">
            {analytics && analytics.overview && (
              <BudgetThermometer
                spent={analytics.overview.totalSpent}
                total={analytics.overview.allowance}
              />
            )}
            {analytics && analytics.gamification && (
              <StreakTracker
                streakData={{
                  currentStreak: analytics.gamification.currentStreak,
                  longestStreak: analytics.gamification.longestStreak,
                  disciplineScore: analytics.gamification.disciplineScore,
                  isActive: analytics.gamification.disciplineScore >= 50
                }}
              />
            )}
            {analytics && analytics.gamification && (
              <BadgeDisplay 
                earnedBadges={analytics.gamification.badges?.map(badge => 
                  typeof badge === 'string' ? { id: badge, badgeId: badge } : badge
                ) || []}
              />
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <RecentExpenses expenses={expenses.slice(0, 10)} onRefresh={() => setRefreshKey(prev => prev + 1)} />
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          onClose={() => setShowAddExpense(false)}
          onSuccess={handleExpenseAdded}
        />
      )}
    </DashboardLayout>
  );
}
