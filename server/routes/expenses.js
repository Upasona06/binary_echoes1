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
    
    // Update user's last active date
    await User.findByIdAndUpdate(req.user.id, { lastActiveDate: new Date() });
    
    res.status(201).json({ expense, message: 'Expense added successfully' });
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
