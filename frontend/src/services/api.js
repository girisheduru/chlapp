/**
 * API service for making HTTP requests to the backend
 */

const API_BASE_URL = '/api/v1';

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
};

/**
 * Streaks API
 */
export const streaksAPI = {
  getAll: () => apiRequest('/streaks'),
  getById: (id) => apiRequest(`/streaks/${id}`),
  create: (data) => apiRequest('/streaks', { method: 'POST', body: data }),
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
