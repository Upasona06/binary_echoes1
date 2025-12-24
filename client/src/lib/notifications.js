// Browser Notification Utilities for Expense Reminders

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Check if notifications are enabled
export const areNotificationsEnabled = () => {
  return 'Notification' in window && Notification.permission === 'granted';
};

// Send a browser notification
export const sendNotification = (title, options = {}) => {
  if (!areNotificationsEnabled()) {
    console.log('Notifications not enabled');
    return null;
  }

  const defaultOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    tag: 'spendsense-reminder',
    renotify: true,
    requireInteraction: false,
    ...options
  };

  try {
    const notification = new Notification(title, defaultOptions);
    
    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.onClick) {
        options.onClick();
      }
    };

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

// Check if we should send a reminder today
export const shouldSendReminder = () => {
  const lastReminder = localStorage.getItem('lastExpenseReminder');
  const today = new Date().toDateString();
  
  // Only remind once per day
  if (lastReminder === today) {
    return false;
  }
  
  return true;
};

// Mark that we sent a reminder today
export const markReminderSent = () => {
  const today = new Date().toDateString();
  localStorage.setItem('lastExpenseReminder', today);
};

// Check if user has added expenses today
export const hasExpensesToday = (expenses) => {
  if (!expenses || expenses.length === 0) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return expenses.some(expense => {
    const expenseDate = new Date(expense.date || expense.createdAt);
    expenseDate.setHours(0, 0, 0, 0);
    return expenseDate.getTime() === today.getTime();
  });
};

// Get reminder time preference from localStorage
export const getReminderTime = () => {
  return localStorage.getItem('expenseReminderTime') || '20:00'; // Default 8 PM
};

// Set reminder time preference
export const setReminderTime = (time) => {
  localStorage.setItem('expenseReminderTime', time);
};

// Check if it's time for the evening reminder
export const isReminderTime = () => {
  const reminderTime = getReminderTime();
  const [hours, minutes] = reminderTime.split(':').map(Number);
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Check if we're within 30 minutes of reminder time
  const reminderMinutes = hours * 60 + minutes;
  const currentMinutes = currentHour * 60 + currentMinute;
  
  return currentMinutes >= reminderMinutes && currentMinutes <= reminderMinutes + 30;
};

// Send expense reminder notification
export const sendExpenseReminder = () => {
  if (!shouldSendReminder()) {
    return false;
  }

  const notification = sendNotification('💰 Don\'t forget to track your expenses!', {
    body: 'You haven\'t added any expenses today. Tap to add one now!',
    tag: 'expense-reminder',
    requireInteraction: true,
    actions: [
      { action: 'add', title: 'Add Expense' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  });

  if (notification) {
    markReminderSent();
    return true;
  }

  return false;
};

// Initialize notification system
export const initNotifications = async () => {
  const hasPermission = await requestNotificationPermission();
  
  if (hasPermission) {
    console.log('Notification permission granted');
  }
  
  return hasPermission;
};
