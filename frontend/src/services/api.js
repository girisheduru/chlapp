/**
 * API service for making HTTP requests to the backend.
 * When setApiTokenGetter is set (by AuthProvider), requests include Authorization: Bearer <token>.
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
              if (retryResponse.status === 204) return undefined;
              const retryText = await retryResponse.text();
              return retryText && retryText.trim() ? JSON.parse(retryText) : undefined;
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

    // 204 No Content (e.g. DELETE) has no body
    if (response.status === 204) {
      return undefined;
    }
    const text = await response.text();
    if (!text || text.trim() === '') {
      return undefined;
    }
    return JSON.parse(text);
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
  /** Prefetch reflection items for all user habits (triggers background generation). */
  prefetchReflections: () =>
    apiRequest('/prefetchReflections', { method: 'POST' }),
  /** Save reflection answers (Q1/Q2, identity alignment, experiment) and update habit preferences. */
  saveReflectionAnswers: (data) =>
    apiRequest('/saveReflectionAnswers', { method: 'POST', body: data }),
  /** Get latest saved reflection answers for a habit. Returns null if none found. */
  getLatestReflectionAnswers: (habitId) =>
    apiRequest(`/getLatestReflectionAnswers?habitId=${encodeURIComponent(habitId)}`).catch(() => null),
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
