const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get dashboard analytics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    // Get user
    const user = await User.findById(req.user.id);
    
    // Get all expenses for the month
    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Calculate totals
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remainingAllowance = user.monthlyAllowance - totalSpent;
    const budgetUsagePercentage = user.monthlyAllowance > 0 
      ? (totalSpent / user.monthlyAllowance) * 100 
      : 0;
    
    // Category breakdown
    const categoryData = {};
    expenses.forEach(exp => {
      if (!categoryData[exp.category]) {
        categoryData[exp.category] = 0;
      }
      categoryData[exp.category] += exp.amount;
    });
    
    // Daily spending
    const dailyData = {};
    expenses.forEach(exp => {
      const dateKey = exp.date.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = 0;
      }
      dailyData[dateKey] += exp.amount;
    });
    
    const dailySpending = Object.keys(dailyData).map(date => ({
      date,
      amount: dailyData[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Heatmap data (all days of month)
    const heatmapData = [];
    for (let day = 1; day <= new Date(currentYear, currentMonth, 0).getDate(); day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const dateKey = date.toISOString().split('T')[0];
      heatmapData.push({
        date: dateKey,
        amount: dailyData[dateKey] || 0
      });
    }
    
    // Format category data
    const totalSpentValue = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categories = Object.keys(categoryData).map(cat => ({
      name: cat,
      amount: categoryData[cat],
      percentage: totalSpentValue > 0 ? (categoryData[cat] / totalSpentValue) * 100 : 0
    }));
    
    res.json({
      overview: {
        totalSpent,
        remainingAllowance,
        allowance: user.monthlyAllowance,
        budgetUsagePercentage,
        allowancePercentage: user.monthlyAllowance > 0 
          ? (remainingAllowance / user.monthlyAllowance) * 100 
          : 0,
        isOverBudget: totalSpent > user.monthlyAllowance,
        expenseCount: expenses.length
      },
      categories,
      dailySpending,
      heatmapData,
      gamification: {
        currentStreak: user.savingStreak || 0,
        longestStreak: user.longestStreak || 0,
        disciplineScore: user.budgetDisciplineScore || 0,
        badges: user.badges || []
      },
      totalSpent,
      remainingAllowance,
      budgetUsagePercentage,
      allowancePercentage: user.monthlyAllowance > 0 
        ? (remainingAllowance / user.monthlyAllowance) * 100 
        : 0,
      isOverBudget: totalSpent > user.monthlyAllowance,
      expenseCount: expenses.length,
      monthlyAllowance: user.monthlyAllowance,
      categoryData,
      month: currentMonth,
      year: currentYear
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get category breakdown
router.get('/category-breakdown', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });
    
    const categoryData = {};
    const categoryCount = {};
    
    expenses.forEach(exp => {
      if (!categoryData[exp.category]) {
        categoryData[exp.category] = 0;
        categoryCount[exp.category] = 0;
      }
      categoryData[exp.category] += exp.amount;
      categoryCount[exp.category]++;
    });
    
    const categories = Object.keys(categoryData).map(cat => ({
      category: cat,
      amount: categoryData[cat],
      count: categoryCount[cat],
      percentage: 0
    }));
    
    const total = categories.reduce((sum, cat) => sum + cat.amount, 0);
    categories.forEach(cat => {
      cat.percentage = total > 0 ? (cat.amount / total) * 100 : 0;
    });
    
    res.json({ categories, total });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get daily spending
router.get('/daily-spending', auth, async (req, res) => {
  try {
    const { month, year, days = 30 } = req.query;
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    const dailyData = {};
    expenses.forEach(exp => {
      const dateKey = exp.date.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = 0;
      }
      dailyData[dateKey] += exp.amount;
    });
    
    const dailySpending = Object.keys(dailyData).map(date => ({
      date,
      amount: dailyData[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json({ dailySpending });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get heatmap data
router.get('/heatmap', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });
    
    const dailyData = {};
    expenses.forEach(exp => {
      const dateKey = exp.date.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = 0;
      }
      dailyData[dateKey] += exp.amount;
    });
    
    // Generate full month data
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const heatmapData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const dateKey = date.toISOString().split('T')[0];
      heatmapData.push({
        date: dateKey,
        day: day,
        amount: dailyData[dateKey] || 0
      });
    }
    
    res.json({ heatmapData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
