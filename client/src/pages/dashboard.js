import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/lib/axios';
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
import { Plus } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Data Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Unable to load dashboard data. Please refresh or add your first expense.
          </p>
          <button
            onClick={() => setShowAddExpense(true)}
            className="btn-primary flex items-center gap-2"
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => setShowAddExpense(true)}
            className="btn-primary flex items-center gap-2 justify-center"
          >
            <Plus className="w-5 h-5" />
            Add Expense
          </button>
        </div>

        {/* Budget Setup Alert */}
        {analytics && analytics.overview && analytics.overview.allowance === 0 && (
          <div className="px-6 py-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-3xl">💡</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Set Up Your Budget
                </h3>
                <p className="text-blue-700 dark:text-blue-300 mb-3">
                  Configure your monthly allowance and category budgets to start tracking your expenses effectively.
                </p>
                <button
                  onClick={() => router.push('/setup')}
                  className="btn-primary text-sm"
                >
                  Configure Budget Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            {warnings.map((warning, idx) => (
              <div
                key={idx}
                className={`px-4 py-3 rounded-lg border ${
                  warning.severity === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                    : warning.severity === 'high'
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400'
                }`}
              >
                {warning.message}
              </div>
            ))}
          </div>
        )}

        {/* Overview Cards */}
        {analytics && <OverviewCards analytics={analytics} />}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {analytics && analytics.categoryData && <CategoryBreakdown categoryData={analytics.categoryData} />}
            {analytics && analytics.dailySpending && <DailySpendingChart dailyData={analytics.dailySpending} />}
            {analytics && analytics.heatmapData && <SpendingHeatmap heatmapData={analytics.heatmapData} />}
          </div>

          {/* Right Column - 1/3 */}
          <div className="space-y-6">
            {analytics && analytics.overview && (
              <BudgetThermometer
                spent={analytics.overview.totalSpent}
                total={analytics.overview.allowance}
              />
            )}
            {analytics && analytics.gamification && (
              <StreakTracker
                currentStreak={analytics.gamification.currentStreak}
                longestStreak={analytics.gamification.longestStreak}
                disciplineScore={analytics.gamification.disciplineScore}
              />
            )}
            {analytics && analytics.gamification && <BadgeDisplay badges={analytics.gamification.badges} />}
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
