// Central API Client fetch wrapper with token refresh interceptor & GET response caching

const apiCache = new Map();
const MAX_CACHE_ENTRIES = 50;
const TTL_MS = 30000; // 30s TTL cache

export const apiClient = async (endpoint, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  let token = localStorage.getItem('campusconnect_token');

  // Invalidate cache on state mutation requests (POST, PUT, DELETE, PATCH)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    apiCache.clear();
  }

  // Return cached payload for GET requests if fresh
  if (method === 'GET' && !options.skipCache) {
    const cacheKey = `${endpoint}_${JSON.stringify(options.params || {})}_${token || ''}`;
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
  }

  const buildHeaders = (t) => ({
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
    ...options.headers
  });

  const config = {
    ...options,
    headers: buildHeaders(token)
  };

  let res = await fetch(endpoint, config);
  let data = await res.json().catch(() => ({}));

  // Automatic 401 TOKEN_EXPIRED interceptor to auto-refresh access token seamlessly
  if (res.status === 401 && (data.code === 'TOKEN_EXPIRED' || data.message?.includes('expired'))) {
    const refreshToken = localStorage.getItem('campusconnect_refresh_token');
    if (refreshToken && !options._isRetry) {
      try {
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        const refreshData = await refreshRes.json();
        if (refreshRes.ok && (refreshData.data?.accessToken || refreshData.accessToken)) {
          const newAccessToken = refreshData.data?.accessToken || refreshData.accessToken;
          localStorage.setItem('campusconnect_token', newAccessToken);

          // Retry original request once with new token
          const retryConfig = {
            ...options,
            _isRetry: true,
            headers: buildHeaders(newAccessToken)
          };
          res = await fetch(endpoint, retryConfig);
          data = await res.json().catch(() => ({}));
        }
      } catch (e) {}
    }
  }

  if (!res.ok) {
    const errorMsg = data.message || data.error || `HTTP error ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  const result = data.data !== undefined ? data.data : data;

  // Cache GET successful response (with LRU bounds)
  if (method === 'GET' && !options.skipCache) {
    const cacheKey = `${endpoint}_${JSON.stringify(options.params || {})}_${token || ''}`;
    if (apiCache.size >= MAX_CACHE_ENTRIES) {
      const firstKey = apiCache.keys().next().value;
      apiCache.delete(firstKey);
    }
    apiCache.set(cacheKey, { data: result, expiresAt: Date.now() + TTL_MS });
  }

  return result;
};

export const clearApiCache = () => {
  apiCache.clear();
};
