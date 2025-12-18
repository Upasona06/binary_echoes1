import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { Award, Lock, Trophy, Star, Zap, Target } from 'lucide-react';

const BADGE_DEFINITIONS = [
  {
    id: 'first_expense',
    name: 'First Step',
    description: 'Added your first expense',
    icon: Star,
    color: 'from-blue-400 to-blue-600',
    requirement: 'Add your first expense to the system'
  },
  {
    id: 'week_saver',
    name: 'Week Saver',
    description: 'Stayed under budget for a week',
    icon: Target,
    color: 'from-green-400 to-green-600',
    requirement: 'Keep spending under budget for 7 consecutive days'
  },
  {
    id: 'budget_master',
    name: 'Budget Master',
    description: 'Stayed under budget for a month',
    icon: Trophy,
    color: 'from-yellow-400 to-yellow-600',
    requirement: 'Complete a full month without exceeding your budget'
  },
  {
    id: 'penny_pincher',
    name: 'Penny Pincher',
    description: 'Saved 50% of monthly allowance',
    icon: Zap,
    color: 'from-purple-400 to-purple-600',
    requirement: 'End a month having spent less than 50% of your budget'
  },
  {
    id: 'streak_warrior',
    name: 'Streak Warrior',
    description: 'Maintained a 30-day saving streak',
    icon: Award,
    color: 'from-orange-400 to-orange-600',
    requirement: 'Stay under daily budget limit for 30 consecutive days'
  },
  {
    id: 'financial_guru',
    name: 'Financial Guru',
    description: 'Perfect budget management for 3 months',
    icon: Trophy,
    color: 'from-red-400 to-red-600',
    requirement: 'Stay under budget for 3 consecutive months'
  }
];

export default function Badges() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [userBadges, setUserBadges] = useState([]);
  const [badgeDetails, setBadgeDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchBadges();
    }
  }, [user]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/dashboard');
      const gamification = response.data.gamification || {};
      const earnedBadges = gamification.badges || [];
      
      setUserBadges(earnedBadges);

      // Merge earned badges with definitions
      const details = BADGE_DEFINITIONS.map(badge => {
        const isEarned = earnedBadges.includes(badge.id);
        return {
          ...badge,
          earned: isEarned,
          earnedDate: isEarned ? user.badgeEarnedDates?.[badge.id] || new Date() : null
        };
      });

      setBadgeDetails(details);
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const earnedCount = badgeDetails.filter(b => b.earned).length;
  const totalCount = BADGE_DEFINITIONS.length;
  const progress = (earnedCount / totalCount) * 100;

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Achievements
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your financial journey milestones
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{earnedCount} / {totalCount} Badges</h2>
              <p className="text-primary-100 mt-1">Keep going to unlock all achievements!</p>
            </div>
            <Trophy className="w-16 h-16 opacity-80" />
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-primary-100 mt-2">{progress.toFixed(0)}% Complete</p>
        </div>

        {/* Earned Badges */}
        {earnedCount > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Earned Badges ({earnedCount})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badgeDetails.filter(badge => badge.earned).map((badge) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {badge.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {badge.description}
                    </p>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                        ✓ EARNED
                      </p>
                      {badge.earnedDate && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(badge.earnedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Locked Badges */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Locked Badges ({totalCount - earnedCount})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badgeDetails.filter(badge => !badge.earned).map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 opacity-60 hover:opacity-80 transition-opacity"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
                    <Lock className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {badge.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {badge.description}
                  </p>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      How to unlock:
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-500">
                      {badge.requirement}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivation Section */}
        {earnedCount < totalCount && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-3xl">🎯</div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Keep It Up!
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  You're doing great! Continue managing your budget wisely to unlock more achievements and track your financial progress.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
