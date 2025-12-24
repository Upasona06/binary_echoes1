import { Award, Lock, Sparkles, Star } from 'lucide-react';

const AVAILABLE_BADGES = [
  {
    id: 'first_expense',
    name: 'First Step',
    description: 'Added your first expense',
    icon: '🎯',
    color: 'from-blue-500 to-cyan-600',
    bgLight: 'from-blue-50 to-cyan-50',
    bgDark: 'from-blue-900/20 to-cyan-900/20',
  },
  {
    id: 'week_saver',
    name: 'Week Saver',
    description: 'Stayed under budget for 7 days',
    icon: '⭐',
    color: 'from-amber-400 to-yellow-500',
    bgLight: 'from-amber-50 to-yellow-50',
    bgDark: 'from-amber-900/20 to-yellow-900/20',
  },
  {
    id: 'budget_master',
    name: 'Budget Master',
    description: 'Completed a month under budget',
    icon: '👑',
    color: 'from-violet-500 to-purple-600',
    bgLight: 'from-violet-50 to-purple-50',
    bgDark: 'from-violet-900/20 to-purple-900/20',
  },
  {
    id: 'penny_pincher',
    name: 'Penny Pincher',
    description: 'Saved 50% of allowance',
    icon: '💰',
    color: 'from-emerald-500 to-green-600',
    bgLight: 'from-emerald-50 to-green-50',
    bgDark: 'from-emerald-900/20 to-green-900/20',
  },
  {
    id: 'streak_warrior',
    name: 'Streak Warrior',
    description: 'Maintained 14-day streak',
    icon: '🔥',
    color: 'from-orange-500 to-red-600',
    bgLight: 'from-orange-50 to-red-50',
    bgDark: 'from-orange-900/20 to-red-900/20',
  },
  {
    id: 'financial_guru',
    name: 'Financial Guru',
    description: 'Tracked expenses for 3 months',
    icon: '🧠',
    color: 'from-indigo-500 to-blue-600',
    bgLight: 'from-indigo-50 to-blue-50',
    bgDark: 'from-indigo-900/20 to-blue-900/20',
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

  const earnedCount = earned.length;
  const totalCount = AVAILABLE_BADGES.length;
  const progressPercent = Math.round((earnedCount / totalCount) * 100);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-900/10 dark:to-yellow-900/10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-6 shadow-lg hover:shadow-xl transition-all">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-transparent dark:from-amber-600/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl shadow-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Achievements</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Unlock badges by completing goals</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-amber-200 dark:border-amber-800 shadow-sm">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {earnedCount}/{totalCount}
            </span>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 gap-3">
          {AVAILABLE_BADGES.map((badge) => {
            const isEarned = isBadgeEarned(badge.id);
            const earnedDate = getBadgeDate(badge.id);

            return (
              <div
                key={badge.id}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                  isEarned
                    ? `border-transparent bg-gradient-to-br ${badge.bgLight} dark:${badge.bgDark} hover:scale-[1.02] hover:shadow-lg cursor-pointer`
                    : 'border-gray-200/80 dark:border-gray-700/80 bg-gray-100/50 dark:bg-gray-800/50 opacity-50 grayscale'
                }`}
              >
                {/* Badge Icon */}
                <div className="flex items-center gap-3">
                  <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md ${
                    isEarned
                      ? `bg-gradient-to-br ${badge.color}`
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {isEarned ? (
                      <>
                        <span className="relative z-10">{badge.icon}</span>
                        <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
                      </>
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold truncate ${
                      isEarned
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {badge.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {badge.description}
                    </p>
                  </div>
                </div>

                {/* Earned Date */}
                {isEarned && earnedDate && (
                  <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                    <p className={`text-xs font-medium bg-gradient-to-r ${badge.color} bg-clip-text text-transparent`}>
                      ✨ Earned {earnedDate}
                    </p>
                  </div>
                )}

                {/* Earned Checkmark */}
                {isEarned && (
                  <div className={`absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br ${badge.color} rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-md`}>
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Section */}
        <div className="mt-6 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Collection Progress</span>
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
              {progressPercent}%
            </span>
          </div>
          <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-700 rounded-full"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/30 rounded-full"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            {totalCount - earnedCount === 0 
              ? '🎉 All badges collected!' 
              : `${totalCount - earnedCount} more badge${totalCount - earnedCount > 1 ? 's' : ''} to unlock`}
          </p>
        </div>
      </div>
    </div>
  );
}
