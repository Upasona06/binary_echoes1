import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { TrendingUp, TrendingDown, Calendar, PieChart } from 'lucide-react';
import CategoryBreakdown from '@/components/Dashboard/CategoryBreakdown';
import DailySpendingChart from '@/components/Dashboard/DailySpendingChart';

export default function Analytics() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, selectedMonth, selectedYear]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [currentRes, previousRes] = await Promise.all([
        api.get(`/analytics/dashboard?month=${selectedMonth}&year=${selectedYear}`),
        api.get(`/analytics/dashboard?month=${selectedMonth === 1 ? 12 : selectedMonth - 1}&year=${selectedMonth === 1 ? selectedYear - 1 : selectedYear}`)
      ]);

      setAnalytics(currentRes.data);
      
      // Calculate comparison
      const current = currentRes.data.totalSpent;
      const previous = previousRes.data.totalSpent;
      const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
      
      setComparisonData({
        current,
        previous,
        change,
        isIncrease: change > 0
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Detailed insights into your spending patterns
            </p>
          </div>

          {/* Month/Year Selector */}
          <div className="flex gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="input-field"
            >
              {months.map((month, idx) => (
                <option key={month} value={idx + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="input-field"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
              <TrendingUp className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ₹{analytics?.totalSpent?.toFixed(2) || '0.00'}
            </p>
            {comparisonData && (
              <p className={`text-sm mt-2 ${comparisonData.isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                {comparisonData.isIncrease ? '↑' : '↓'} {Math.abs(comparisonData.change).toFixed(1)}% from last month
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining</p>
              <TrendingDown className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ₹{analytics?.remainingAllowance?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {analytics?.allowancePercentage?.toFixed(1)}% of budget
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expenses</p>
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {analytics?.expenseCount || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Transactions this month
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Per Day</p>
              <PieChart className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ₹{analytics?.totalSpent ? (analytics.totalSpent / new Date().getDate()).toFixed(2) : '0.00'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Daily average
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analytics && analytics.categoryData && (
            <CategoryBreakdown categoryData={analytics.categoryData} />
          )}
          {analytics && analytics.dailySpending && (
            <DailySpendingChart dailyData={analytics.dailySpending} />
          )}
        </div>

        {/* Category Details Table */}
        {analytics && analytics.categories && analytics.categories.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Category Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Category</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.categories.map((cat) => (
                    <tr key={cat.name} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 text-gray-900 dark:text-white capitalize">{cat.name}</td>
                      <td className="py-3 px-4 text-right text-gray-900 dark:text-white">₹{cat.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                        {cat.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Previous Month Comparison */}
        {comparisonData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Month-over-Month Comparison
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Previous Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{comparisonData.previous.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{comparisonData.current.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Change</p>
                <p className={`text-2xl font-bold ${comparisonData.isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                  {comparisonData.isIncrease ? '+' : ''}{comparisonData.change.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
