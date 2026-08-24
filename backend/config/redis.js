const Redis = require('ioredis');

let client = null;
let redisReady = false;

const memoryStore = new Map();

const isRedisEnabled = () => {
  const flag = (process.env.REDIS_ENABLED || 'true').toLowerCase();
  return flag !== 'false' && flag !== '0';
};

const connectRedis = async () => {
  if (!isRedisEnabled()) {
    console.log('Redis disabled (REDIS_ENABLED=false). Using in-memory catalog cache.');
    return;
  }

  if (client) return;

  const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  client = new Redis(url, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 1500,
    retryStrategy(times) {
      if (times > 5) return null;
      return Math.min(times * 400, 4000);
    }
  });

  client.on('ready', () => {
    redisReady = true;
    console.log('Redis connected:', url);
  });

  client.on('end', () => {
    redisReady = false;
  });

  client.on('error', (err) => {
    redisReady = false;
    if (!connectRedis._warned) {
      connectRedis._warned = true;
      console.warn('Redis unavailable, using in-memory cache:', err.message);
    }
  });

  try {
    await client.ping();
    redisReady = true;
  } catch (err) {
    redisReady = false;
    console.warn('Redis not running on', url, '- using in-memory cache until it starts.');
  }
};

const getRedisStatus = () => ({
  enabled: isRedisEnabled(),
  connected: redisReady,
  mode: redisReady ? 'redis' : 'memory'
});

const memoryGet = (key) => {
  const row = memoryStore.get(key);
  if (!row) return null;
  if (Date.now() > row.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return row.value;
};

const memorySet = (key, value, ttlSeconds) => {
  memoryStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000
  });
};

const memoryDel = (key) => {
  memoryStore.delete(key);
};

const cacheGet = async (key) => {
  if (redisReady && client) {
    try {
      const raw = await client.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      redisReady = false;
    }
  }
  return memoryGet(key);
};

const cacheSet = async (key, value, ttlSeconds = 60) => {
  memorySet(key, value, ttlSeconds);
  if (redisReady && client) {
    try {
      await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      redisReady = false;
    }
  }
};

const cacheDel = async (...keys) => {
  keys.filter(Boolean).forEach(memoryDel);
  if (redisReady && client && keys.length) {
    try {
      await client.del(keys);
    } catch (err) {
      redisReady = false;
    }
  }
};

module.exports = {
  connectRedis,
  getRedisStatus,
  cacheGet,
  cacheSet,
  cacheDel,
  isRedisEnabled
};
