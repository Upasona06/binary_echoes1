const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Category budget schema (stored in User model)
const CATEGORIES = ['food', 'travel', 'bills', 'subscriptions', 'others'];

// Set/Update category budget
router.post('/', auth, async (req, res) => {
  try {
    const { category, limit } = req.body;
    
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user.categoryBudgets) {
      user.categoryBudgets = {};
    }
    
    user.categoryBudgets[category] = parseFloat(limit);
    await user.save();
    
    res.json({ 
      message: 'Budget updated successfully',
      categoryBudgets: user.categoryBudgets
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all category budgets
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { month, year } = req.query;
    
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    // Get current month expenses
    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Calculate spent per category
    const categorySpent = {};
    expenses.forEach(exp => {
      if (!categorySpent[exp.category]) {
        categorySpent[exp.category] = 0;
      }
      categorySpent[exp.category] += exp.amount;
    });
    
    // Build budget status
    const budgets = CATEGORIES.map(cat => {
      const limit = user.categoryBudgets?.[cat] || 0;
      const spent = categorySpent[cat] || 0;
      const remaining = limit - spent;
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;
      
      return {
        category: cat,
        limit,
        spent,
        remaining,
        percentage,
        status: percentage > 100 ? 'exceeded' : percentage > 80 ? 'warning' : 'good'
      };
    });
    
    res.json({
      budgets,
      totalBudget: user.monthlyAllowance,
      categoryBudgets: user.categoryBudgets || {}
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get budget warnings
router.get('/warnings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { month, year } = req.query;
    
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    // Get current month expenses
    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });
    
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Calculate spent per category
    const categorySpent = {};
    expenses.forEach(exp => {
      if (!categorySpent[exp.category]) {
        categorySpent[exp.category] = 0;
      }
      categorySpent[exp.category] += exp.amount;
    });
    
    const warnings = [];
    
    // Overall budget warning
    if (totalSpent > user.monthlyAllowance) {
      warnings.push({
        type: 'overall',
        severity: 'critical',
        message: `You've exceeded your monthly allowance by ₹${(totalSpent - user.monthlyAllowance).toFixed(2)}`,
        category: 'overall',
        percentage: (totalSpent / user.monthlyAllowance) * 100
      });
    } else if (totalSpent > user.monthlyAllowance * 0.8) {
      warnings.push({
        type: 'overall',
        severity: 'warning',
        message: `You've used ${((totalSpent / user.monthlyAllowance) * 100).toFixed(1)}% of your monthly allowance`,
        category: 'overall',
        percentage: (totalSpent / user.monthlyAllowance) * 100
      });
    }
    
    // Category budget warnings
    if (user.categoryBudgets) {
      Object.keys(user.categoryBudgets).forEach(cat => {
        const limit = user.categoryBudgets[cat];
        const spent = categorySpent[cat] || 0;
        const percentage = limit > 0 ? (spent / limit) * 100 : 0;
        
        if (spent > limit) {
          warnings.push({
            type: 'category',
            severity: 'critical',
            message: `${cat.charAt(0).toUpperCase() + cat.slice(1)} budget exceeded by ₹${(spent - limit).toFixed(2)}`,
            category: cat,
            percentage
          });
        } else if (percentage > 80) {
          warnings.push({
            type: 'category',
            severity: 'warning',
            message: `${cat.charAt(0).toUpperCase() + cat.slice(1)} budget at ${percentage.toFixed(1)}%`,
            category: cat,
            percentage
          });
        }
      });
    }
    
    res.json({ warnings, count: warnings.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reset monthly budget (should be run via cron job)
router.post('/reset', auth, async (req, res) => {
  try {
    // This would typically be called by a cron job for all users
    // For now, just returns a message
    res.json({ 
      message: 'Budget reset is handled automatically at the start of each month',
      note: 'Expenses are filtered by month, so budget effectively resets'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
