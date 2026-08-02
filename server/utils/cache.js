// High-performance in-memory TTL & LRU caching service with ETag & Express middleware support
const crypto = require('crypto');

class CacheService {
  constructor(maxSize = 500) {
    this.store = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    // Refresh position for LRU
    this.store.delete(key);
    this.store.set(key, item);
    return item.value;
  }

  set(key, value, ttlSeconds = 60) {
    if (this.store.size >= this.maxSize) {
      // LRU eviction: remove oldest key
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  del(key) {
    this.store.delete(key);
  }

  delByPattern(prefixOrPattern) {
    const isRegex = prefixOrPattern instanceof RegExp;
    for (const key of this.store.keys()) {
      if (isRegex ? prefixOrPattern.test(key) : key.startsWith(prefixOrPattern)) {
        this.store.delete(key);
      }
    }
  }

  flush() {
    this.store.clear();
  }
}

const cacheInstance = new CacheService();

/**
 * Express middleware for automatic JSON API caching & ETag support.
 * @param {number} ttlSeconds - Time-to-live in seconds
 * @param {function} keyGen - Optional custom key generator function (req => string)
 */
const cacheMiddleware = (ttlSeconds = 60, keyGen = null) => {
  return (req, res, next) => {
    // Only cache GET / HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    const key = keyGen ? keyGen(req) : `${req.originalUrl || req.url}_${req.user?.id || 'anon'}`;
    const cachedItem = cacheInstance.get(key);

    if (cachedItem) {
      const { data, etag } = cachedItem;
      res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 2}`);
      if (etag) {
        res.setHeader('ETag', etag);
        if (req.headers['if-none-match'] === etag) {
          return res.status(304).end();
        }
      }
      return res.status(200).json(data);
    }

    // Intercept res.json to capture and cache output safely
    const originalJson = res.json;
    res.json = function (body) {
      res.json = originalJson; // Restore original to prevent call stack recursion
      if (res.statusCode === 200 && body && body.success !== false) {
        try {
          const bodyStr = JSON.stringify(body);
          const etag = `W/"${crypto.createHash('md5').update(bodyStr).digest('hex')}"`;
          cacheInstance.set(key, { data: body, etag }, ttlSeconds);
          res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 2}`);
          res.setHeader('ETag', etag);
        } catch (e) {}
      }
      return originalJson.call(this, body);
    };

    next();
  };
};

module.exports = cacheInstance;
module.exports.cache = cacheInstance;
module.exports.cacheMiddleware = cacheMiddleware;

