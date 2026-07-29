// Central API Client fetch wrapper with authorization header injection, GET response caching & error handling

const apiCache = new Map();
const TTL_MS = 30000; // 30s TTL cache

export const apiClient = async (endpoint, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const token = localStorage.getItem('campusconnect_token');

  // Invalidate cache on state mutation requests (POST, PUT, DELETE, PATCH)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    apiCache.clear();
  }

  // Return cached payload for GET requests if fresh
  if (method === 'GET' && !options.skipCache) {
    const cacheKey = `${endpoint}_${token || ''}`;
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  const res = await fetch(endpoint, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.message || data.error || `HTTP error ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  const result = data.data !== undefined ? data.data : data;

  // Cache GET successful response
  if (method === 'GET' && !options.skipCache) {
    const cacheKey = `${endpoint}_${token || ''}`;
    apiCache.set(cacheKey, { data: result, expiresAt: Date.now() + TTL_MS });
  }

  return result;
};

export const clearApiCache = () => {
  apiCache.clear();
};
