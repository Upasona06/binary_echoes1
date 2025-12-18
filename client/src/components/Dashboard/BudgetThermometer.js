import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function BudgetThermometer({ spent, total }) {
  const amount = spent || 0;
  const budget = total || 0;
  const percentage = budget > 0 ? (amount / budget) * 100 : 0;
  
  const getColor = () => {
    if (percentage <= 50) return 'bg-green-500';
    if (percentage <= 75) return 'bg-yellow-500';
    if (percentage <= 100) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTextColor = () => {
    if (percentage <= 50) return 'text-green-600 dark:text-green-400';
    if (percentage <= 75) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage <= 100) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatus = () => {
    if (percentage <= 50) return { icon: TrendingDown, text: 'Great Control!', color: 'text-green-600' };
    if (percentage <= 75) return { icon: Minus, text: 'On Track', color: 'text-yellow-600' };
    if (percentage <= 100) return { icon: TrendingUp, text: 'Approaching Limit', color: 'text-orange-600' };
    return { icon: TrendingUp, text: 'Over Budget!', color: 'text-red-600' };
  };

  const status = getStatus();
  const Icon = status.icon;
  const clampedPercentage = Math.min(percentage, 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Budget Thermometer
      </h3>
      
      <div className="flex items-center gap-6">
        {/* Thermometer Visual */}
        <div className="relative w-12 h-64 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {/* Mercury fill */}
          <div
            className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ${getColor()}`}
            style={{ height: `${clampedPercentage}%` }}
          >
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/20"></div>
          </div>
          
          {/* Bulb */}
          <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full ${getColor()} border-4 border-white dark:border-gray-800`}>
            <div className="absolute inset-2 bg-white/30 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <Icon className={`w-6 h-6 ${status.color}`} />
            <span className={`text-lg font-semibold ${status.color}`}>
              {status.text}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Budget Used</p>
              <p className={`text-3xl font-bold ${getTextColor()}`}>
                {percentage.toFixed(1)}%
              </p>
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Spent</span>
                <span className="font-semibold text-gray-900 dark:text-white">₹{amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Budget</span>
                <span className="font-semibold text-gray-900 dark:text-white">₹{budget.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ₹{Math.max(0, budget - amount).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
