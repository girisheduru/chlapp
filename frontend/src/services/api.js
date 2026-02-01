/**
 * API service for making HTTP requests to the backend.
 * When setApiTokenGetter is set (by AuthProvider), requests include Authorization: Bearer <token>.
 */

const API_BASE_URL = '/api/v1';

/** Optional async getter for Firebase ID token; set by app when auth is configured. */
let tokenGetter = null;
/** Called when API returns 401 (e.g. sign out and optionally redirect). */
let onUnauthorized = null;

/**
 * Set the function used to get the current auth token for API requests.
 * Getter may accept (forceRefresh?: boolean) for retry-after-401.
 * @param {((forceRefresh?: boolean) => Promise<string | null>) | null} getter
 */
export function setApiTokenGetter(getter) {
  tokenGetter = getter;
}

/**
 * Set the callback invoked when a request returns 401 (e.g. sign out so user can sign in again).
 * @param {(() => void) | null} callback
 */
export function setOnUnauthorized(callback) {
  onUnauthorized = callback;
}

/**
 * Generic fetch wrapper with error handling.
 * Attaches Authorization: Bearer <token> when tokenGetter is set and returns a token.
 * On 401, retries once with a fresh token (forceRefresh) before calling onUnauthorized.
 */
async function apiRequest(endpoint, options = {}, isRetryAfter401 = false) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (tokenGetter) {
    try {
      const forceRefresh = isRetryAfter401;
      const token = await tokenGetter(forceRefresh);
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignore token errors; request may still succeed in dev without Firebase
    }
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      if (!isRetryAfter401 && tokenGetter) {
        try {
          const freshToken = await tokenGetter(true);
          if (freshToken) {
            const retryHeaders = { ...headers, Authorization: `Bearer ${freshToken}` };
            const retryConfig = { ...config, headers: retryHeaders };
            const retryResponse = await fetch(url, retryConfig);
            if (retryResponse.ok) {
              return await retryResponse.json();
            }
            if (retryResponse.status !== 401) {
              const error = await retryResponse.json().catch(() => ({ message: retryResponse.statusText }));
              const err = new Error(error.message || error.detail || `HTTP error! status: ${retryResponse.status}`);
              err.status = retryResponse.status;
              err.detail = error.detail ?? error;
              throw err;
            }
          }
        } catch (retryErr) {
          if (retryErr?.status !== undefined) throw retryErr;
          // Fall through to onUnauthorized
        }
      }
      if (typeof onUnauthorized === 'function') {
        onUnauthorized();
      }
      const detail = await response.json().catch(() => ({}));
      const err = new Error(detail.detail || 'Unauthorized');
      err.status = 401;
      throw err;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      const err = new Error(error.message || error.detail || `HTTP error! status: ${response.status}`);
      err.status = response.status;
      err.detail = error.detail ?? error;
      throw err;
    }

    return await response.json();
  } catch (error) {
    if (error?.status !== undefined) {
      console.error('API request failed:', error.status, error.message, error.detail);
    } else {
      console.error('API request failed (network or other):', error);
    }
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
  /** Get reflection items for the reflect screen (insights, questions, experiment suggestions). Requires habitId. */
  getReflectionItems: (habitId) =>
    apiRequest(`/getReflectionItems?habitId=${encodeURIComponent(habitId)}`),
  /** Get list of reflection question prompts (all habits). Optional userId for compatibility. */
  getReflectionInputs: (userId) =>
    apiRequest(`/getReflectionInputs?userId=${encodeURIComponent(userId)}`),
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
