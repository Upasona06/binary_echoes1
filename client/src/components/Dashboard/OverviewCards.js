import { Wallet, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

export default function OverviewCards({ analytics }) {
  const cards = [
    {
      title: 'Total Spent',
      value: `₹${analytics?.totalSpent?.toFixed(2) || '0.00'}`,
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      detail: `${analytics?.expenseCount || 0} expenses`,
    },
    {
      title: 'Remaining Allowance',
      value: `₹${analytics?.remainingAllowance?.toFixed(2) || '0.00'}`,
      icon: Wallet,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      detail: `${analytics?.allowancePercentage?.toFixed(1) || '0'}% remaining`,
    },
    {
      title: 'Budget Status',
      value: analytics?.isOverBudget ? 'Over Budget' : 'On Track',
      icon: analytics?.isOverBudget ? AlertCircle : CheckCircle,
      color: analytics?.isOverBudget
        ? 'text-orange-600 dark:text-orange-400'
        : 'text-primary-600 dark:text-primary-400',
      bg: analytics?.isOverBudget
        ? 'bg-orange-50 dark:bg-orange-900/20'
        : 'bg-primary-50 dark:bg-primary-900/20',
      detail: `${analytics?.budgetUsagePercentage?.toFixed(1) || '0'}% used`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {card.detail}
                </p>
              </div>
              <div className={`${card.bg} ${card.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
