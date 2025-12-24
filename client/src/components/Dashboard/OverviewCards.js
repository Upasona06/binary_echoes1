import { Wallet, TrendingDown, AlertCircle, CheckCircle, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';

export default function OverviewCards({ analytics }) {
  const cards = [
    {
      title: 'Total Spent',
      value: `₹${analytics?.totalSpent?.toLocaleString() || '0'}`,
      icon: TrendingDown,
      gradient: 'from-red-500 to-rose-600',
      lightBg: 'bg-red-50 dark:bg-red-900/20',
      detail: `${analytics?.expenseCount || 0} expenses this month`,
      trend: analytics?.totalSpent > 0 ? 'up' : null,
      trendValue: null,
    },
    {
      title: 'Remaining Budget',
      value: `₹${analytics?.remainingAllowance?.toLocaleString() || '0'}`,
      icon: Wallet,
      gradient: 'from-emerald-500 to-green-600',
      lightBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      detail: `${analytics?.allowancePercentage?.toFixed(0) || '0'}% of budget remaining`,
      trend: analytics?.remainingAllowance > 0 ? 'safe' : 'warning',
      trendValue: null,
    },
    {
      title: 'Budget Status',
      value: analytics?.isOverBudget ? 'Over Budget' : 'On Track',
      icon: analytics?.isOverBudget ? AlertCircle : CheckCircle,
      gradient: analytics?.isOverBudget ? 'from-orange-500 to-amber-600' : 'from-primary-500 to-blue-600',
      lightBg: analytics?.isOverBudget ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-primary-50 dark:bg-primary-900/20',
      detail: `${analytics?.budgetUsagePercentage?.toFixed(0) || '0'}% budget utilized`,
      trend: analytics?.isOverBudget ? 'warning' : 'safe',
      trendValue: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-6 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            {/* Background gradient accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`}></div>
            
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {card.title}
                  </p>
                  {card.trend === 'safe' && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-semibold rounded-full">
                      <Sparkles className="w-3 h-3" />
                      Good
                    </span>
                  )}
                  {card.trend === 'warning' && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-semibold rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      Alert
                    </span>
                  )}
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {card.value}
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  {card.detail}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Progress bar for budget usage */}
            {card.title === 'Budget Status' && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-500 dark:text-gray-400">Budget Usage</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{analytics?.budgetUsagePercentage?.toFixed(0) || 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${card.gradient} transition-all duration-1000`}
                    style={{ width: `${Math.min(analytics?.budgetUsagePercentage || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
