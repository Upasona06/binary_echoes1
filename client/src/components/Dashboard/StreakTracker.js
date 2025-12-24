import { Flame, TrendingUp, Award, Zap, Target, Trophy } from 'lucide-react';

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
    if (currentStreak < 3) return { gradient: 'from-gray-500 to-slate-600', bg: 'from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50', level: 'Beginner', emoji: '🌱' };
    if (currentStreak < 7) return { gradient: 'from-blue-500 to-cyan-600', bg: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20', level: 'Committed', emoji: '💪' };
    if (currentStreak < 14) return { gradient: 'from-violet-500 to-purple-600', bg: 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20', level: 'Dedicated', emoji: '⚡' };
    if (currentStreak < 30) return { gradient: 'from-orange-500 to-red-600', bg: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20', level: 'Master', emoji: '🔥' };
    return { gradient: 'from-yellow-500 to-amber-600', bg: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20', level: 'Legend', emoji: '👑' };
  };

  const level = getStreakLevel();
  const nextMilestone = currentStreak < 7 ? 7 : currentStreak < 14 ? 14 : currentStreak < 30 ? 30 : 60;
  const progressToMilestone = Math.min(100, (currentStreak / nextMilestone) * 100);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${level.bg} bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-6 shadow-lg hover:shadow-xl transition-all`}>
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/30 to-transparent dark:from-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 bg-gradient-to-br ${level.gradient} rounded-xl shadow-lg`}>
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Streak Tracker</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Keep the momentum going!</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${level.gradient} text-white text-xs font-bold shadow-md`}>
            <span>{level.emoji}</span>
            <span>{level.level}</span>
          </div>
        </div>

        <div className="space-y-5">
          {/* Current Streak - Main Display */}
          <div className="text-center py-4">
            <div className="relative inline-block">
              {/* Outer glow ring */}
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${level.gradient} opacity-20 blur-xl scale-110 ${streakActive ? 'animate-pulse' : ''}`}></div>
              
              {/* Main circle */}
              <div className={`relative w-28 h-28 rounded-full flex items-center justify-center ${streakActive ? `bg-gradient-to-br ${level.gradient}` : 'bg-gray-200 dark:bg-gray-700'} shadow-xl`}>
                {streakActive && (
                  <div className="absolute inset-1 rounded-full bg-white/20"></div>
                )}
                <div className="text-center">
                  <Flame className={`w-10 h-10 mx-auto ${streakActive ? 'text-white' : 'text-gray-400'} ${streakActive ? 'animate-bounce' : ''}`} style={{ animationDuration: '2s' }} />
                </div>
              </div>
              
              {/* Active indicator */}
              {streakActive && (
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center border-3 border-white dark:border-gray-800 shadow-lg">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="mt-4">
              <p className={`text-5xl font-black ${streakActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                {currentStreak}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
              </p>
            </div>

            <p className={`mt-3 text-sm font-semibold bg-gradient-to-r ${level.gradient} bg-clip-text text-transparent`}>
              {getStreakMessage()}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-md">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {longestStreak}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Best Streak
              </p>
            </div>

            <div className="p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-center">
              <div className={`w-10 h-10 mx-auto mb-2 bg-gradient-to-br ${streakActive ? 'from-emerald-400 to-green-500' : 'from-gray-400 to-gray-500'} rounded-lg flex items-center justify-center shadow-md`}>
                <Target className="w-5 h-5 text-white" />
              </div>
              <p className={`text-2xl font-bold ${streakActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                {streakActive ? 'Active' : 'Idle'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Status
              </p>
            </div>
          </div>

          {/* Milestone Progress */}
          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Next Milestone</span>
              </div>
              <span className={`text-sm font-bold bg-gradient-to-r ${level.gradient} bg-clip-text text-transparent`}>
                {nextMilestone} days
              </span>
            </div>
            <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${level.gradient} transition-all duration-700 rounded-full`}
                style={{ width: `${progressToMilestone}%` }}
              >
                <div className="absolute inset-0 bg-white/30 rounded-full"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              {nextMilestone - currentStreak} days to go!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
