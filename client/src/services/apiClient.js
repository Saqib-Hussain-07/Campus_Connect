// Central API Client fetch wrapper with token refresh interceptor & smart domain-scoped GET caching

const apiCache = new Map();
const MAX_CACHE_ENTRIES = 100;
const DEFAULT_TTL_MS = 30000; // 30s default TTL

const getDomainPrefix = (endpoint) => {
  if (!endpoint) return '';
  const match = endpoint.match(/^\/api\/([^\/?#]+)/);
  return match ? match[1] : '';
};

let refreshPromise = null;

export const apiClient = async (endpoint, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  let token = localStorage.getItem('campusconnect_token');

  // Smart domain-scoped cache invalidation on state mutations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const domain = getDomainPrefix(endpoint);
    const invalidateTarget = options.invalidatePrefix || domain;
    if (invalidateTarget) {
      invalidateCacheByPattern(invalidateTarget);
    } else {
      apiCache.clear();
    }
  }

  // Return cached payload for GET requests if fresh
  const cacheKey = `${endpoint}_${JSON.stringify(options.params || {})}_${token || ''}`;
  if (method === 'GET' && !options.skipCache) {
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
    credentials: 'same-origin',
    ...options,
    headers: buildHeaders(token)
  };

  let res = await fetch(endpoint, config);
  let data = await res.json().catch(() => ({}));

  // Automatic 401 TOKEN_EXPIRED interceptor to auto-refresh access token seamlessly
  const isTokenExpired =
    res.status === 401 &&
    (data.error?.code === 'TOKEN_EXPIRED' ||
      data.code === 'TOKEN_EXPIRED' ||
      data.errors?.code === 'TOKEN_EXPIRED' ||
      data.message?.includes('expired') ||
      data.error?.message?.includes('expired'));

  if (isTokenExpired) {
    if (!options._isRetry) {
      try {
        if (!refreshPromise) {
          refreshPromise = (async () => {
            const currentRefreshToken = localStorage.getItem('campusconnect_refresh_token');
            const refreshRes = await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: currentRefreshToken || '' })
            });
            const refreshData = await refreshRes.json();
            const newAccessToken = refreshData.token || refreshData.data?.token || refreshData.accessToken || refreshData.data?.accessToken;
            const newRefreshToken = refreshData.refreshToken || refreshData.data?.refreshToken;

            if (refreshRes.ok && newAccessToken) {
              localStorage.setItem('campusconnect_token', newAccessToken);
              if (newRefreshToken) {
                localStorage.setItem('campusconnect_refresh_token', newRefreshToken);
              }
              return newAccessToken;
            }
            return null;
          })().finally(() => {
            refreshPromise = null;
          });
        }

        const newAccessToken = await refreshPromise;
        if (newAccessToken) {
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
    const errorMsg =
      data.error?.message ||
      (typeof data.error === 'string' ? data.error : null) ||
      data.message ||
      `HTTP error ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.code = data.error?.code || data.code || null;
    err.details = data.error?.details || data.errors || null;
    err.data = data;
    throw err;
  }

  const result = data.data !== undefined ? data.data : data;

  // Cache GET successful response (with LRU bounds and custom TTL)
  if (method === 'GET' && !options.skipCache) {
    const ttl = options.ttl || DEFAULT_TTL_MS;
    if (apiCache.size >= MAX_CACHE_ENTRIES) {
      const firstKey = apiCache.keys().next().value;
      apiCache.delete(firstKey);
    }
    apiCache.set(cacheKey, { data: result, expiresAt: Date.now() + ttl });
  }

  return result;
};

export const invalidateCacheByPattern = (pattern) => {
  for (const key of apiCache.keys()) {
    if (key.includes(pattern)) {
      apiCache.delete(key);
    }
  }
};

export const clearApiCache = () => {
  apiCache.clear();
};

apiClient.get = (endpoint, options = {}) => apiClient(endpoint, { ...options, method: 'GET' });
apiClient.post = (endpoint, body, options = {}) =>
  apiClient(endpoint, {
    ...options,
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body)
  });
apiClient.put = (endpoint, body, options = {}) =>
  apiClient(endpoint, {
    ...options,
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body)
  });
apiClient.patch = (endpoint, body, options = {}) =>
  apiClient(endpoint, {
    ...options,
    method: 'PATCH',
    body: body instanceof FormData ? body : JSON.stringify(body)
  });
apiClient.delete = (endpoint, options = {}) =>
  apiClient(endpoint, { ...options, method: 'DELETE' });

export default apiClient;
