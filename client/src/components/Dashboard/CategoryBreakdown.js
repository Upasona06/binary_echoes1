import { useEffect, useRef, useState } from 'react';
import { Chart, ArcElement, PieController, Tooltip, Legend } from 'chart.js';
import { PieChart, ShoppingBag, Plane, FileText, Tv, MoreHorizontal } from 'lucide-react';

Chart.register(ArcElement, PieController, Tooltip, Legend);

const CATEGORY_CONFIG = {
  food: { 
    bg: 'rgba(251, 146, 60, 0.8)', 
    border: 'rgb(251, 146, 60)', 
    gradient: 'from-orange-500 to-amber-600',
    icon: ShoppingBag,
    lightBg: 'bg-orange-50 dark:bg-orange-900/20'
  },
  travel: { 
    bg: 'rgba(59, 130, 246, 0.8)', 
    border: 'rgb(59, 130, 246)', 
    gradient: 'from-blue-500 to-cyan-600',
    icon: Plane,
    lightBg: 'bg-blue-50 dark:bg-blue-900/20'
  },
  bills: { 
    bg: 'rgba(234, 179, 8, 0.8)', 
    border: 'rgb(234, 179, 8)', 
    gradient: 'from-yellow-500 to-amber-600',
    icon: FileText,
    lightBg: 'bg-yellow-50 dark:bg-yellow-900/20'
  },
  subscriptions: { 
    bg: 'rgba(168, 85, 247, 0.8)', 
    border: 'rgb(168, 85, 247)', 
    gradient: 'from-violet-500 to-purple-600',
    icon: Tv,
    lightBg: 'bg-violet-50 dark:bg-violet-900/20'
  },
  others: { 
    bg: 'rgba(107, 114, 128, 0.8)', 
    border: 'rgb(107, 114, 128)', 
    gradient: 'from-gray-500 to-slate-600',
    icon: MoreHorizontal,
    lightBg: 'bg-gray-50 dark:bg-gray-700/50'
  },
};

export default function CategoryBreakdown({ categoryData }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !chartRef.current || !categoryData || Object.keys(categoryData).length === 0) return;

    // Destroy previous chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    try {
      const ctx = chartRef.current.getContext('2d');

      const labels = Object.keys(categoryData).map(cat => cat.charAt(0).toUpperCase() + cat.slice(1));
      const data = Object.values(categoryData);
      const backgroundColors = Object.keys(categoryData).map(cat => CATEGORY_CONFIG[cat]?.bg || 'rgba(107, 114, 128, 0.8)');
      const borderColors = Object.keys(categoryData).map(cat => CATEGORY_CONFIG[cat]?.border || 'rgb(107, 114, 128)');

      chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 3,
            hoverBorderWidth: 4,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false, // We'll create custom legend
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
    } catch (error) {
      console.error('Error creating category chart:', error);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [categoryData, isClient]);

  // Calculate totals for legend
  const totalSpent = categoryData ? Object.values(categoryData).reduce((a, b) => a + b, 0) : 0;

  if (!categoryData || Object.keys(categoryData).length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
            <PieChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Category Breakdown</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Spending by category</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-3">
            <PieChart className="w-8 h-8 text-gray-400" />
          </div>
          <p className="font-medium">No expense data yet</p>
          <p className="text-sm text-gray-400">Start adding expenses to see breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-6 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
          <PieChart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Category Breakdown</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total: ₹{totalSpent.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="relative h-64 flex items-center justify-center">
          <canvas ref={chartRef}></canvas>
        </div>
        
        {/* Custom Legend */}
        <div className="space-y-2">
          {Object.entries(categoryData).map(([category, amount]) => {
            const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.others;
            const Icon = config.icon;
            const percentage = ((amount / totalSpent) * 100).toFixed(1);
            
            return (
              <div 
                key={category}
                className={`flex items-center gap-3 p-3 rounded-xl ${config.lightBg} transition-all hover:scale-[1.02] cursor-pointer`}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient} shadow-md`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                      {category}
                    </span>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      ₹{amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
