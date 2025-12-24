const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all expenses for user
router.get('/', auth, async (req, res) => {
  try {
    const { month, year, category } = req.query;
    
    let query = { user: req.user.id };
    
    // Filter by month/year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    // Filter by category if provided
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const expenses = await Expense.find(query).sort({ date: -1 });
    
    res.json({ expenses, count: expenses.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single expense
router.get('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({ expense });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Badge definitions for checking
const BADGE_DEFINITIONS = [
  {
    id: 'first_expense',
    checkCondition: async (user, expenses) => expenses.length >= 1
  },
  {
    id: 'week_saver',
    checkCondition: async (user, expenses) => user.savingStreak >= 7
  },
  {
    id: 'budget_master',
    checkCondition: async (user, expenses) => {
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
    checkCondition: async (user, expenses) => user.savingStreak >= 14
  },
  {
    id: 'financial_guru',
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

// Helper function to update streak
const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const expenses = await Expense.find({
    user: userId,
    date: { $gte: monthStart }
  });
  
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const expectedSpendingByNow = (user.monthlyAllowance / daysInMonth) * currentDay;
  
  // Check if last active was today to prevent multiple streak updates
  const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const wasActiveToday = lastActive && lastActive >= today;
  
  if (!wasActiveToday) {
    if (totalSpent <= expectedSpendingByNow || user.monthlyAllowance === 0) {
      user.savingStreak = (user.savingStreak || 0) + 1;
      if (user.savingStreak > (user.longestStreak || 0)) {
        user.longestStreak = user.savingStreak;
      }
    } else {
      user.savingStreak = 0;
    }
  }
  
  // Update discipline score
  const budgetPerformance = user.monthlyAllowance > 0 
    ? Math.max(0, Math.min(100, 100 - ((totalSpent / user.monthlyAllowance - 1) * 100)))
    : 100;
  
  user.budgetDisciplineScore = Math.round(budgetPerformance);
  
  await user.save();
  return user;
};

// Helper function to check and award badges
const checkBadges = async (userId) => {
  const user = await User.findById(userId);
  const expenses = await Expense.find({ user: userId });
  const newBadges = [];
  
  for (const badgeDef of BADGE_DEFINITIONS) {
    if (user.badges && user.badges.includes(badgeDef.id)) {
      continue;
    }
    
    const earned = await badgeDef.checkCondition(user, expenses);
    
    if (earned) {
      if (!user.badges) user.badges = [];
      user.badges.push(badgeDef.id);
      
      if (!user.badgeEarnedDates) {
        user.badgeEarnedDates = new Map();
      }
      user.badgeEarnedDates.set(badgeDef.id, new Date());
      
      newBadges.push(badgeDef.id);
    }
  }
  
  if (newBadges.length > 0) {
    await user.save();
  }
  
  return newBadges;
};

// Create expense
router.post('/', auth, async (req, res) => {
  try {
    const { amount, category, description, date, paymentMethod } = req.body;
    
    // Validation
    if (!amount || !category || !description || !date) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    const expense = await Expense.create({
      user: req.user.id,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date(date),
      paymentMethod: paymentMethod || 'cash'
    });
    
    // Update streak and check badges after adding expense
    await updateStreak(req.user.id);
    const newBadges = await checkBadges(req.user.id);
    
    // Update user's last active date
    await User.findByIdAndUpdate(req.user.id, { lastActiveDate: new Date() });
    
    res.status(201).json({ 
      expense, 
      message: 'Expense added successfully',
      newBadges: newBadges.length > 0 ? newBadges : undefined
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update expense
router.put('/:id', auth, async (req, res) => {
  try {
    const { amount, category, description, date, paymentMethod } = req.body;
    
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Update fields
    if (amount !== undefined) expense.amount = parseFloat(amount);
    if (category) expense.category = category;
    if (description) expense.description = description;
    if (date) expense.date = new Date(date);
    if (paymentMethod) expense.paymentMethod = paymentMethod;
    
    await expense.save();
    
    res.json({ expense, message: 'Expense updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
