const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const User = require('../models/User');
const auth = require('../middleware/auth');

const BADGE_DEFINITIONS = [
  {
    id: 'first_expense',
    name: 'First Step',
    description: 'Added your first expense',
    checkCondition: async (user, expenses) => expenses.length >= 1
  },
  {
    id: 'week_saver',
    name: 'Week Saver',
    description: 'Stayed under budget for 7 days',
    checkCondition: async (user, expenses) => user.savingStreak >= 7
  },
  {
    id: 'budget_master',
    name: 'Budget Master',
    description: 'Completed a month under budget',
    checkCondition: async (user, expenses) => {
      // Check if any previous month was under budget
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      
      const lastMonthExpenses = await Expense.find({
        user: user._id,
        date: { $gte: lastMonth, $lte: lastMonthEnd }
      });
      
      const totalSpent = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      return totalSpent <= user.monthlyAllowance && totalSpent > 0;
    }
  },
  {
    id: 'penny_pincher',
    name: 'Penny Pincher',
    description: 'Saved 50% of allowance',
    checkCondition: async (user, expenses) => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthExpenses = await Expense.find({
        user: user._id,
        date: { $gte: monthStart }
      });
      
      const totalSpent = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      return totalSpent <= user.monthlyAllowance * 0.5;
    }
  },
  {
    id: 'streak_warrior',
    name: 'Streak Warrior',
    description: 'Maintained 14-day streak',
    checkCondition: async (user, expenses) => user.savingStreak >= 14
  },
  {
    id: 'financial_guru',
    name: 'Financial Guru',
    description: 'Tracked expenses for 3 months',
    checkCondition: async (user, expenses) => {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const oldExpenses = await Expense.find({
        user: user._id,
        date: { $lte: threeMonthsAgo }
      });
      
      return oldExpenses.length > 0;
    }
  }
];

// Get user badges
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const badges = user.badges.map(badgeId => {
      const definition = BADGE_DEFINITIONS.find(b => b.id === badgeId);
      return {
        id: badgeId,
        badgeId: badgeId,
        name: definition?.name || badgeId,
        description: definition?.description || '',
        earnedAt: user.badgeEarnedDates?.[badgeId] || user.createdAt
      };
    });
    
    res.json({ 
      badges,
      count: badges.length,
      total: BADGE_DEFINITIONS.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check and award badges
router.post('/check', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const expenses = await Expense.find({ user: req.user.id });
    
    const newBadges = [];
    
    for (const badgeDef of BADGE_DEFINITIONS) {
      // Skip if already earned
      if (user.badges.includes(badgeDef.id)) {
        continue;
      }
      
      // Check condition
      const earned = await badgeDef.checkCondition(user, expenses);
      
      if (earned) {
        user.badges.push(badgeDef.id);
        
        // Store earned date
        if (!user.badgeEarnedDates) {
          user.badgeEarnedDates = {};
        }
        user.badgeEarnedDates[badgeDef.id] = new Date();
        
        newBadges.push({
          id: badgeDef.id,
          name: badgeDef.name,
          description: badgeDef.description
        });
      }
    }
    
    if (newBadges.length > 0) {
      await user.save();
    }
    
    res.json({
      message: newBadges.length > 0 ? 'New badges earned!' : 'No new badges',
      newBadges,
      totalBadges: user.badges.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get available badges (all possible badges)
router.get('/available', auth, async (req, res) => {
  try {
    const availableBadges = BADGE_DEFINITIONS.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description
    }));
    
    res.json({ badges: availableBadges, count: availableBadges.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
