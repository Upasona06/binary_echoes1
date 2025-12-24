import { useEffect, useRef, useState } from 'react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

Chart.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DailySpendingChart({ dailyData }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !chartRef.current || !dailyData || dailyData.length === 0) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    try {
      const ctx = chartRef.current.getContext('2d');
      const isDark = document.documentElement.classList.contains('dark');

    const labels = dailyData.map(d => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });
    const data = dailyData.map(d => d.amount);

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.4)');

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Daily Spending',
            data,
            backgroundColor: gradient,
            borderColor: 'rgb(99, 102, 241)',
            borderWidth: 0,
            borderRadius: 8,
            borderSkipped: false,
            hoverBackgroundColor: 'rgba(99, 102, 241, 1)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: function(context) {
                return `📅 ${context[0].label}`;
              },
              label: function (context) {
                return `Spent: ₹${context.parsed.y.toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: isDark ? '#9ca3af' : '#6b7280',
              font: { size: 11 },
            },
            border: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.8)',
              drawBorder: false,
            },
            ticks: {
              color: isDark ? '#9ca3af' : '#6b7280',
              font: { size: 11 },
              callback: function (value) {
                return '₹' + value.toLocaleString();
              },
              padding: 8,
            },
            border: {
              display: false,
            },
          },
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart',
        },
      },
    });
    } catch (error) {
      console.error('Error creating daily spending chart:', error);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dailyData, isClient]);

  // Calculate stats
  const totalSpent = dailyData ? dailyData.reduce((sum, d) => sum + d.amount, 0) : 0;
  const avgSpent = dailyData && dailyData.length > 0 ? totalSpent / dailyData.length : 0;
  const maxSpent = dailyData ? Math.max(...dailyData.map(d => d.amount)) : 0;
  
  // Trend calculation
  const getTrend = () => {
    if (!dailyData || dailyData.length < 2) return { icon: Minus, text: 'Stable', color: 'text-gray-500' };
    const recent = dailyData.slice(-3).reduce((sum, d) => sum + d.amount, 0) / 3;
    const earlier = dailyData.slice(0, 3).reduce((sum, d) => sum + d.amount, 0) / 3;
    if (recent > earlier * 1.1) return { icon: TrendingUp, text: 'Increasing', color: 'text-red-500' };
    if (recent < earlier * 0.9) return { icon: TrendingDown, text: 'Decreasing', color: 'text-emerald-500' };
    return { icon: Minus, text: 'Stable', color: 'text-gray-500' };
  };
  const trend = getTrend();
  const TrendIcon = trend.icon;

  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daily Spending Trend</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Track your daily expenses</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-3">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="font-medium">No spending data yet</p>
          <p className="text-sm text-gray-400">Data will appear as you add expenses</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-6 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daily Spending Trend</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last {dailyData.length} days</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 ${trend.color}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-xs font-medium">{trend.text}</span>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-xl text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Total</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">₹{totalSpent.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Daily Avg</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">₹{avgSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Peak Day</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">₹{maxSpent.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="relative h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
