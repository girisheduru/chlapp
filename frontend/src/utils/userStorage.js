/**
 * Utility functions for managing user and habit IDs in localStorage
 */

/**
 * Get or create user ID and habit ID from localStorage
 * @returns {{userId: string, habitId: string}}
 */
export const getOrCreateUserAndHabitIds = () => {
  let userId = localStorage.getItem('chl_userId');
  let habitId = localStorage.getItem('chl_habitId');
  
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chl_userId', userId);
  }
  
  if (!habitId) {
    habitId = `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chl_habitId', habitId);
  }
  
  return { userId, habitId };
};

/**
 * Get user ID from localStorage
 * @returns {string|null}
 */
export const getUserId = () => {
  return localStorage.getItem('chl_userId');
};

/**
 * Get habit ID from localStorage
 * @returns {string|null}
 */
export const getHabitId = () => {
  return localStorage.getItem('chl_habitId');
};

/**
 * Clear user and habit IDs from localStorage
 */
export const clearUserAndHabitIds = () => {
  localStorage.removeItem('chl_userId');
  localStorage.removeItem('chl_habitId');
};
