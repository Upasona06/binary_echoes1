export default function SpendingHeatmap({ heatmapData }) {
  const getDaysInMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  };

  const getIntensityColor = (amount) => {
    if (!amount || amount === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (amount < 100) return 'bg-green-200 dark:bg-green-900/40';
    if (amount < 300) return 'bg-yellow-200 dark:bg-yellow-900/40';
    if (amount < 500) return 'bg-orange-300 dark:bg-orange-900/50';
    return 'bg-red-400 dark:bg-red-900/60';
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Spending Heatmap
      </h3>

      <div className="space-y-2">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-2 text-xs text-center text-gray-600 dark:text-gray-400 font-medium mb-2">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        {/* Heatmap grid */}
        {grid.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-2">
            {week.map((day, dayIdx) => (
              <div key={dayIdx} className="relative group">
                {day ? (
                  <div
                    className={`aspect-square rounded ${getIntensityColor(day.amount)} border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300 hover:ring-2 hover:ring-primary-500 transition-all cursor-pointer`}
                  >
                    {day.day}
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        Day {day.day}: ₹{day.amount.toFixed(2)}
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

      {/* Legend */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"></div>
          <div className="w-4 h-4 rounded bg-green-200 dark:bg-green-900/40 border border-gray-200 dark:border-gray-700"></div>
          <div className="w-4 h-4 rounded bg-yellow-200 dark:bg-yellow-900/40 border border-gray-200 dark:border-gray-700"></div>
          <div className="w-4 h-4 rounded bg-orange-300 dark:bg-orange-900/50 border border-gray-200 dark:border-gray-700"></div>
          <div className="w-4 h-4 rounded bg-red-400 dark:bg-red-900/60 border border-gray-200 dark:border-gray-700"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
