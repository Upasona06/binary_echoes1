import { CalendarDays } from 'lucide-react';

export default function SpendingHeatmap({ heatmapData }) {
  const getDaysInMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  };

  const getCurrentMonth = () => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getIntensityColor = (amount) => {
    if (!amount || amount === 0) return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    if (amount < 100) return 'bg-emerald-200 dark:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700';
    if (amount < 300) return 'bg-yellow-200 dark:bg-yellow-900/50 border-yellow-300 dark:border-yellow-700';
    if (amount < 500) return 'bg-orange-300 dark:bg-orange-800/60 border-orange-400 dark:border-orange-600';
    return 'bg-red-400 dark:bg-red-800/70 border-red-500 dark:border-red-600';
  };

  const getIntensityText = (amount) => {
    if (!amount || amount === 0) return 'text-gray-400';
    if (amount < 100) return 'text-emerald-700 dark:text-emerald-300';
    if (amount < 300) return 'text-yellow-700 dark:text-yellow-300';
    if (amount < 500) return 'text-orange-700 dark:text-orange-200';
    return 'text-white';
  };

  const days = getDaysInMonth();
  const weeks = Math.ceil(days / 7);

  // Create grid data
  const grid = [];
  for (let week = 0; week < weeks; week++) {
    const weekDays = [];
    for (let day = 0; day < 7; day++) {
      const dayNumber = week * 7 + day + 1;
      if (dayNumber <= days) {
        const dayData = heatmapData?.find(d => {
          const date = new Date(d.date);
          return date.getDate() === dayNumber;
        });
        weekDays.push({
          day: dayNumber,
          amount: dayData?.amount || 0,
        });
      } else {
        weekDays.push(null);
      }
    }
    grid.push(weekDays);
  }

  // Calculate stats
  const totalDaysWithSpending = heatmapData?.filter(d => d.amount > 0).length || 0;
  const highestDay = heatmapData?.reduce((max, d) => d.amount > max.amount ? d : max, { amount: 0 }) || { amount: 0 };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-6 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Spending Heatmap</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{getCurrentMonth()}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{totalDaysWithSpending} active days</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Peak: ₹{highestDay.amount?.toLocaleString() || 0}</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-xl p-4">
        <div className="space-y-2">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1.5 text-xs text-center text-gray-500 dark:text-gray-400 font-semibold mb-3">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div className="text-blue-500">Sat</div>
            <div className="text-red-500">Sun</div>
          </div>

          {/* Heatmap grid */}
          {grid.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-1.5">
              {week.map((day, dayIdx) => (
                <div key={dayIdx} className="relative group">
                  {day ? (
                    <div
                      className={`aspect-square rounded-lg ${getIntensityColor(day.amount)} border-2 flex items-center justify-center text-xs font-bold ${getIntensityText(day.amount)} hover:scale-110 hover:z-10 transition-all cursor-pointer shadow-sm`}
                    >
                      {day.day}
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 pointer-events-none">
                        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
                          <p className="font-semibold mb-0.5">Day {day.day}</p>
                          <p className={day.amount > 0 ? 'text-emerald-400' : 'text-gray-400'}>
                            {day.amount > 0 ? `₹${day.amount.toLocaleString()}` : 'No spending'}
                          </p>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square"></div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 flex items-center justify-center gap-3 text-xs">
        <span className="text-gray-500 dark:text-gray-400 font-medium">Less</span>
        <div className="flex gap-1.5">
          <div className="w-5 h-5 rounded-md bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"></div>
          <div className="w-5 h-5 rounded-md bg-emerald-200 dark:bg-emerald-900/50 border-2 border-emerald-300 dark:border-emerald-700"></div>
          <div className="w-5 h-5 rounded-md bg-yellow-200 dark:bg-yellow-900/50 border-2 border-yellow-300 dark:border-yellow-700"></div>
          <div className="w-5 h-5 rounded-md bg-orange-300 dark:bg-orange-800/60 border-2 border-orange-400 dark:border-orange-600"></div>
          <div className="w-5 h-5 rounded-md bg-red-400 dark:bg-red-800/70 border-2 border-red-500 dark:border-red-600"></div>
        </div>
        <span className="text-gray-500 dark:text-gray-400 font-medium">More</span>
      </div>
    </div>
  );
}
