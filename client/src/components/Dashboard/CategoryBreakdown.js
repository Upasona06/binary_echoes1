import { useEffect, useRef, useState } from 'react';
import { Chart, ArcElement, PieController, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, PieController, Tooltip, Legend);

const CATEGORY_COLORS = {
  food: { bg: 'rgba(251, 146, 60, 0.8)', border: 'rgb(251, 146, 60)' },
  travel: { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgb(59, 130, 246)' },
  bills: { bg: 'rgba(234, 179, 8, 0.8)', border: 'rgb(234, 179, 8)' },
  subscriptions: { bg: 'rgba(168, 85, 247, 0.8)', border: 'rgb(168, 85, 247)' },
  others: { bg: 'rgba(107, 114, 128, 0.8)', border: 'rgb(107, 114, 128)' },
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
      const backgroundColors = Object.keys(categoryData).map(cat => CATEGORY_COLORS[cat]?.bg || 'rgba(107, 114, 128, 0.8)');
      const borderColors = Object.keys(categoryData).map(cat => CATEGORY_COLORS[cat]?.border || 'rgb(107, 114, 128)');

      chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12,
              },
              color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
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

  if (!categoryData || Object.keys(categoryData).length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Category Breakdown
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No expense data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Category Breakdown
      </h3>
      <div className="relative h-80">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
