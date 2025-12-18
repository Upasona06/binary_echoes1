import { Flame, TrendingUp, Award } from 'lucide-react';

export default function StreakTracker({ streakData }) {
  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;
  const streakActive = streakData?.isActive || false;

  const getStreakMessage = () => {
    if (currentStreak === 0) return "Start your streak by staying within budget!";
    if (currentStreak < 3) return "You're building momentum!";
    if (currentStreak < 7) return "Great progress! Keep it up!";
    if (currentStreak < 14) return "You're on fire! Amazing discipline!";
    if (currentStreak < 30) return "Incredible! You're a budget master!";
    return "Legendary streak! Financial guru status!";
  };

  const getStreakLevel = () => {
    if (currentStreak < 3) return { color: 'text-gray-600', bg: 'bg-gray-100', level: 'Beginner' };
    if (currentStreak < 7) return { color: 'text-blue-600', bg: 'bg-blue-100', level: 'Committed' };
    if (currentStreak < 14) return { color: 'text-purple-600', bg: 'bg-purple-100', level: 'Dedicated' };
    if (currentStreak < 30) return { color: 'text-orange-600', bg: 'bg-orange-100', level: 'Master' };
    return { color: 'text-red-600', bg: 'bg-red-100', level: 'Legend' };
  };

  const level = getStreakLevel();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Streak Tracker
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${level.bg} ${level.color}`}>
          {level.level}
        </div>
      </div>

      <div className="space-y-6">
        {/* Current Streak */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${streakActive ? 'bg-gradient-to-br from-orange-400 to-red-500' : 'bg-gray-200 dark:bg-gray-700'} shadow-lg`}>
              <Flame className={`w-16 h-16 ${streakActive ? 'text-white animate-pulse' : 'text-gray-400'}`} />
            </div>
            {streakActive && (
              <div className="absolute -top-1 -right-1 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          <div className="mt-4">
            <p className="text-5xl font-bold text-gray-900 dark:text-white mb-1">
              {currentStreak}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
            </p>
          </div>

          <p className="mt-3 text-sm font-medium text-primary-600 dark:text-primary-400">
            {getStreakMessage()}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Award className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {longestStreak}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Longest Streak
            </p>
          </div>

          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="w-6 h-6 mx-auto mb-2 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {streakActive ? 'Active' : 'Inactive'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Status
            </p>
          </div>
        </div>

        {/* Milestone Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Next Milestone</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {currentStreak < 7 ? '7 days' : currentStreak < 14 ? '14 days' : currentStreak < 30 ? '30 days' : '60 days'}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
              style={{
                width: `${Math.min(100, (currentStreak / (currentStreak < 7 ? 7 : currentStreak < 14 ? 14 : currentStreak < 30 ? 30 : 60)) * 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
