/**
 * Utility functions for managing user and habit IDs in localStorage.
 * When the user is signed in with Firebase, firebaseUid is the canonical userId and is stored here.
 */

/**
 * Generate a new habit ID for adding a new habit (not persisted).
 * Use this when the user clicks "Add a new habit" so each habit gets its own id.
 * @returns {string}
 */
export const createNewHabitId = () => {
  return `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get or create user ID and habit ID from localStorage.
 * When firebaseUid is provided (signed-in user), it is used as userId and persisted.
 * For the first habit, a habitId is created and stored; for "Add habit" use createNewHabitId() instead.
 * @param {string | null | undefined} [firebaseUid] - Firebase user.uid when signed in
 * @returns {{userId: string, habitId: string}}
 */
export const getOrCreateUserAndHabitIds = (firebaseUid = null) => {
  let userId;
  if (firebaseUid) {
    userId = firebaseUid;
    localStorage.setItem('chl_userId', userId);
  } else {
    userId = localStorage.getItem('chl_userId');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chl_userId', userId);
    }
  }

  let habitId = localStorage.getItem('chl_habitId');
  if (!habitId) {
    habitId = createNewHabitId();
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
