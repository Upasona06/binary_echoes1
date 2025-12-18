import { Award, Lock } from 'lucide-react';

const AVAILABLE_BADGES = [
  {
    id: 'first_expense',
    name: 'First Step',
    description: 'Added your first expense',
    icon: '🎯',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'week_saver',
    name: 'Week Saver',
    description: 'Stayed under budget for 7 days',
    icon: '⭐',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    id: 'budget_master',
    name: 'Budget Master',
    description: 'Completed a month under budget',
    icon: '👑',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'penny_pincher',
    name: 'Penny Pincher',
    description: 'Saved 50% of allowance',
    icon: '💰',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'streak_warrior',
    name: 'Streak Warrior',
    description: 'Maintained 14-day streak',
    icon: '🔥',
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'financial_guru',
    name: 'Financial Guru',
    description: 'Tracked expenses for 3 months',
    icon: '🧠',
    color: 'from-indigo-500 to-indigo-600',
  },
];

export default function BadgeDisplay({ earnedBadges }) {
  const earned = earnedBadges || [];

  const isBadgeEarned = (badgeId) => {
    return earned.some(badge => badge.badgeId === badgeId || badge.id === badgeId);
  };

  const getBadgeDate = (badgeId) => {
    const badge = earned.find(b => b.badgeId === badgeId || b.id === badgeId);
    if (!badge?.earnedAt) return null;
    return new Date(badge.earnedAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Achievements
        </h3>
        <span className="ml-auto text-sm text-gray-600 dark:text-gray-400">
          {earned.length} / {AVAILABLE_BADGES.length}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {AVAILABLE_BADGES.map((badge) => {
          const isEarned = isBadgeEarned(badge.id);
          const earnedDate = getBadgeDate(badge.id);

          return (
            <div
              key={badge.id}
              className={`relative p-4 rounded-lg border-2 transition-all ${
                isEarned
                  ? 'border-primary-300 dark:border-primary-700 bg-gradient-to-br ' + badge.color + ' bg-opacity-10 hover:scale-105'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'
              }`}
            >
              {/* Badge Icon */}
              <div className="text-center mb-3">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl ${
                  isEarned
                    ? 'bg-white dark:bg-gray-800 shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {isEarned ? badge.icon : <Lock className="w-6 h-6 text-gray-400" />}
                </div>
              </div>

              {/* Badge Info */}
              <div className="text-center">
                <h4 className={`text-sm font-semibold mb-1 ${
                  isEarned
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {badge.name}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {badge.description}
                </p>
                {isEarned && earnedDate && (
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                    Earned: {earnedDate}
                  </p>
                )}
              </div>

              {/* New Badge Indicator */}
              {isEarned && earnedDate && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                  <span className="text-xs">✓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {Math.round((earned.length / AVAILABLE_BADGES.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
            style={{ width: `${(earned.length / AVAILABLE_BADGES.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
