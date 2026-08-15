/**
 * Offline Sync Queue using native browser IndexedDB
 * Queues mutations (likes, bookmarks, direct messages, RSVP) when offline
 * and replays them automatically upon reconnection.
 */

const DB_NAME = 'CampusConnect_Offline';
const DB_VERSION = 1;
const STORE_NAME = 'mutation_queue';

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      return reject(new Error('IndexedDB not supported on this browser'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Queue a mutation action to be executed when back online
 */
export async function queueOfflineAction(action) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const entry = {
        ...action,
        timestamp: Date.now()
      };
      const req = store.add(entry);
      req.onsuccess = () => {
        // Register for Service Worker background sync if supported
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.sync.register('sync-offline-queue').catch(() => {});
          });
        }
        resolve(req.result);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to queue offline action:', err);
  }
}

/**
 * Get all queued offline actions
 */
export async function getOfflineQueue() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return [];
  }
}

/**
 * Remove a specific processed action from the queue
 */
export async function removeOfflineAction(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to remove queued item:', err);
  }
}

/**
 * Replay all queued offline mutations to the backend
 */
export async function processOfflineQueue(apiClient) {
  const queue = await getOfflineQueue();
  if (queue.length === 0) return { processed: 0, failed: 0 };

  let processed = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      await apiClient(item.url, {
        method: item.method || 'POST',
        body: item.body ? JSON.stringify(item.body) : undefined
      });
      await removeOfflineAction(item.id);
      processed++;
    } catch (err) {
      failed++;
      console.warn(`Offline action ${item.id} retry failed:`, err.message);
    }
  }

  return { processed, failed };
}
