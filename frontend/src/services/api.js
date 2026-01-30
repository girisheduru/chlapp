/**
 * API service for making HTTP requests to the backend
 * 
 * Local development: Uses relative URL '/api/v1' which Vite proxies to http://localhost:8000
 * Production (Vercel): Requires VITE_API_URL env var pointing to your backend (e.g. https://your-api.railway.app)
 */

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // If VITE_API_URL is set (production), use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '') + '/api/v1';
  }
  
  // In development, use relative URL (Vite proxy handles it)
  if (import.meta.env.DEV) {
    return '/api/v1';
  }
  
  // Production without VITE_API_URL - this won't work, warn the user
  console.error(
    '[api.js] VITE_API_URL is not set. API calls will fail with 404/405. ' +
      'Set VITE_API_URL in Vercel → Settings → Environment Variables to your backend URL (e.g. https://your-api.railway.app).'
  );
  return '/api/v1'; // Will fail, but at least shows the error
};

const API_BASE_URL = getApiBaseUrl();

// Debug logging (only in development or when explicitly debugging)
if (import.meta.env.DEV) {
  console.log('[api.js] Running in development mode, using Vite proxy');
  console.log('[api.js] API_BASE_URL =', API_BASE_URL);
} else {
  console.log('[api.js] API_BASE_URL =', API_BASE_URL);
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Habits API
 */
export const habitsAPI = {
  getAll: () => apiRequest('/habits'),
  getById: (id) => apiRequest(`/habits/${id}`),
  create: (data) => apiRequest('/habits', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/habits/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiRequest(`/habits/${id}`, { method: 'DELETE' }),
  saveUserHabitPreference: (data) => apiRequest('/saveUserHabitPreference', { method: 'POST', body: data }),
  getUserHabitById: (userId, habitId) => apiRequest(`/GetUserHabitById?userId=${userId}&habitId=${habitId}`),
  generateIdentities: (data) => apiRequest('/generateIdentities', { method: 'POST', body: data }),
  generateShortHabitOptions: (data) => apiRequest('/generateShortHabitOptions', { method: 'POST', body: data }),
  generateFullHabitOptions: (data) => apiRequest('/generateFullHabitOptions', { method: 'POST', body: data }),
  generateObviousCues: (data) => apiRequest('/generateObviousCues', { method: 'POST', body: data }),
};

/**
 * Streaks API
 */
export const streaksAPI = {
  getAll: () => apiRequest('/streaks'),
  getById: (id) => apiRequest(`/streaks/${id}`),
  create: (data) => apiRequest('/streaks', { method: 'POST', body: data }),
  getUserHabitStreakById: (userId, habitId) => 
    apiRequest(`/getUserHabitStreakById?userId=${userId}&habitId=${habitId}`),
  updateUserHabitStreakById: (data) => 
    apiRequest('/updateUserHabitStreakById', { method: 'POST', body: data }),
};

/**
 * Reflections API
 */
export const reflectionsAPI = {
  getAll: () => apiRequest('/reflections'),
  getById: (id) => apiRequest(`/reflections/${id}`),
  create: (data) => apiRequest('/reflections', { method: 'POST', body: data }),
};

/**
 * Health check
 */
export const healthAPI = {
  check: () => apiRequest('/health'),
};

export default {
  habits: habitsAPI,
  streaks: streaksAPI,
  reflections: reflectionsAPI,
  health: healthAPI,
};
