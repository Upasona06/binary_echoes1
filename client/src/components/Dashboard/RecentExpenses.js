import { format } from 'date-fns';
import { Edit2, Trash2, Receipt, ArrowRight, ShoppingBag, Car, Lightbulb, Smartphone, Package } from 'lucide-react';
import { useRouter } from 'next/router';

const CATEGORY_CONFIG = {
  food: { icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', emoji: '🍔' },
  travel: { icon: Car, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', emoji: '🚗' },
  bills: { icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', emoji: '💡' },
  subscriptions: { icon: Smartphone, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', emoji: '📱' },
  others: { icon: Package, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700', emoji: '📦' },
};

export default function RecentExpenses({ expenses, onRefresh }) {
  const router = useRouter();
  
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Recent Expenses
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
            <Receipt className="w-10 h-10 opacity-50" />
          </div>
          <p className="font-medium">No expenses yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first expense to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Recent Expenses
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Your latest {expenses.length} transactions
          </p>
        </div>
        <button 
          onClick={() => router.push('/expenses')}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {expenses.map((expense, index) => {
          const category = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.others;
          const Icon = category.icon;
          
          return (
            <div
              key={expense._id}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Category Icon */}
              <div className={`w-12 h-12 rounded-xl ${category.bg} flex items-center justify-center flex-shrink-0`}>
                <span className="text-xl">{category.emoji}</span>
              </div>

              {/* Expense Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {expense.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 ${category.bg} ${category.color} rounded-full capitalize font-medium`}>
                        <Icon className="w-3 h-3" />
                        {expense.category}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      ₹{expense.amount?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(expense._id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete expense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
