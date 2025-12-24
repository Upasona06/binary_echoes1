import { TrendingUp, TrendingDown, Minus, Flame, Snowflake, AlertTriangle } from 'lucide-react';

export default function BudgetThermometer({ spent, total }) {
  const amount = spent || 0;
  const budget = total || 0;
  const percentage = budget > 0 ? (amount / budget) * 100 : 0;
  
  const getGradient = () => {
    if (percentage <= 50) return 'from-emerald-400 via-green-500 to-emerald-600';
    if (percentage <= 75) return 'from-yellow-400 via-amber-500 to-yellow-600';
    if (percentage <= 100) return 'from-orange-400 via-orange-500 to-red-500';
    return 'from-red-500 via-rose-600 to-red-700';
  };

  const getBgGradient = () => {
    if (percentage <= 50) return 'from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10';
    if (percentage <= 75) return 'from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10';
    if (percentage <= 100) return 'from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10';
    return 'from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10';
  };

  const getTextColor = () => {
    if (percentage <= 50) return 'text-emerald-600 dark:text-emerald-400';
    if (percentage <= 75) return 'text-amber-600 dark:text-amber-400';
    if (percentage <= 100) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatus = () => {
    if (percentage <= 50) return { icon: Snowflake, text: 'Cool & Controlled', emoji: '❄️', color: 'text-emerald-600 dark:text-emerald-400' };
    if (percentage <= 75) return { icon: Minus, text: 'Warming Up', emoji: '☀️', color: 'text-amber-600 dark:text-amber-400' };
    if (percentage <= 100) return { icon: AlertTriangle, text: 'Getting Hot!', emoji: '🔥', color: 'text-orange-600 dark:text-orange-400' };
    return { icon: Flame, text: 'Overheating!', emoji: '🌋', color: 'text-red-600 dark:text-red-400' };
  };

  const status = getStatus();
  const Icon = status.icon;
  const clampedPercentage = Math.min(percentage, 100);
  const remaining = Math.max(0, budget - amount);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${getBgGradient()} bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-6 shadow-lg hover:shadow-xl transition-all`}>
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-5">
          <div className={`p-2.5 bg-gradient-to-br ${getGradient()} rounded-xl shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Budget Thermometer</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Monitor your spending temperature</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Thermometer Visual */}
          <div className="relative">
            <div className="relative w-10 h-52 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              {/* Scale marks */}
              {[25, 50, 75, 100].map((mark) => (
                <div 
                  key={mark}
                  className="absolute left-0 w-2 h-0.5 bg-gray-400/50 dark:bg-gray-500/50"
                  style={{ bottom: `${mark}%` }}
                />
              ))}
              
              {/* Mercury fill */}
              <div
                className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out bg-gradient-to-t ${getGradient()}`}
                style={{ height: `${clampedPercentage}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/25 rounded-t-full"></div>
                {/* Bubbles effect */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
              </div>
            </div>
            
            {/* Bulb */}
            <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br ${getGradient()} shadow-lg`}>
              <div className="absolute inset-1.5 bg-white/30 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center text-lg">
                {status.emoji}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm mb-4 shadow-sm`}>
              <Icon className={`w-4 h-4 ${status.color}`} />
              <span className={`text-sm font-semibold ${status.color}`}>
                {status.text}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Budget Used</p>
                <p className={`text-4xl font-black ${getTextColor()}`}>
                  {percentage.toFixed(0)}%
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Spent</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">₹{amount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Budget</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">₹{budget.toLocaleString()}</p>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-gray-100/80 to-gray-50/80 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Remaining</p>
                <p className={`text-xl font-bold ${remaining > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {remaining > 0 ? `₹${remaining.toLocaleString()}` : 'Over budget!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
