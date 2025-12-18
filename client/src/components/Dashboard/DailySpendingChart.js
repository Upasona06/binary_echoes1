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

    const labels = dailyData.map(d => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });
    const data = dailyData.map(d => d.amount);

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Daily Spending',
            data,
            backgroundColor: 'rgba(99, 102, 241, 0.5)',
            borderColor: 'rgb(99, 102, 241)',
            borderWidth: 2,
            borderRadius: 6,
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
            callbacks: {
              label: function (context) {
                return `₹${context.parsed.y.toFixed(2)}`;
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
              color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
            },
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
              callback: function (value) {
                return '₹' + value;
              },
            },
          },
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

  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Daily Spending Trend
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No spending data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Daily Spending Trend
      </h3>
      <div className="relative h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
