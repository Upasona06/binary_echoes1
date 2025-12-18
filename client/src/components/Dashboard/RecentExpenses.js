import { format } from 'date-fns';
import { Edit2, Trash2, Receipt } from 'lucide-react';

const CATEGORY_ICONS = {
  food: '🍔',
  travel: '🚗',
  bills: '💡',
  subscriptions: '📱',
  others: '📦',
};

export default function RecentExpenses({ expenses, onRefresh }) {
  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      onRefresh?.();
    } catch (error) {
      alert('Failed to delete expense');
    }
  };

  if (!expenses || expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Expenses
        </h3>
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <Receipt className="w-12 h-12 mb-3 opacity-50" />
          <p>No expenses yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Expenses
      </h3>

      <div className="space-y-3">
        {expenses.map((expense) => (
          <div
            key={expense._id}
            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {/* Category Icon */}
            <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-xl border border-gray-200 dark:border-gray-600">
              {CATEGORY_ICONS[expense.category] || '📦'}
            </div>

            {/* Expense Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {expense.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded capitalize">
                      {expense.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                  ₹{expense.amount?.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1">
              <button
                onClick={() => handleDelete(expense._id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete expense"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
