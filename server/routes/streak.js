const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get current streak data
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Calculate if today's budget was maintained
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayExpenses = await Expense.find({
      user: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    });
    
    const todaySpent = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const dailyBudget = user.monthlyAllowance / 30; // Approximate daily budget
    const isWithinBudget = todaySpent <= dailyBudget;
    
    res.json({
      currentStreak: user.savingStreak || 0,
      longestStreak: user.longestStreak || 0,
      isActive: isWithinBudget,
      todaySpent,
      dailyBudget: dailyBudget.toFixed(2),
      lastUpdated: user.lastActiveDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update streak (called daily or after expenses)
router.post('/update', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get current month expenses
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: monthStart }
    });
    
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Check daily budget
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const expectedSpendingByNow = (user.monthlyAllowance / daysInMonth) * currentDay;
    
    // If within expected spending, increment streak
    if (totalSpent <= expectedSpendingByNow) {
      user.savingStreak = (user.savingStreak || 0) + 1;
      
      // Update longest streak
      if (user.savingStreak > (user.longestStreak || 0)) {
        user.longestStreak = user.savingStreak;
      }
    } else {
      // Reset streak if over budget
      user.savingStreak = 0;
    }
    
    // Update budget discipline score
    const budgetPerformance = user.monthlyAllowance > 0 
      ? Math.max(0, 100 - ((totalSpent / user.monthlyAllowance) * 100))
      : 100;
    
    user.budgetDisciplineScore = Math.round(budgetPerformance);
    user.lastActiveDate = new Date();
    
    await user.save();
    
    res.json({
      currentStreak: user.savingStreak,
      longestStreak: user.longestStreak,
      budgetDisciplineScore: user.budgetDisciplineScore,
      message: user.savingStreak > 0 ? 'Streak maintained!' : 'Streak reset',
      isWithinBudget: totalSpent <= expectedSpendingByNow
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get streak history (optional - for charts)
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // This would require storing daily streak snapshots
    // For now, return current state
    res.json({
      currentStreak: user.savingStreak || 0,
      longestStreak: user.longestStreak || 0,
      history: [] // Could be implemented with a separate StreakHistory model
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
