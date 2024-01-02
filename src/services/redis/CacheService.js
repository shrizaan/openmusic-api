const redis = require('redis');
const config = require('../../utils/config');

class CacheService {
  constructor() {
    this._redisClient = redis.createClient({
      socket: {
        host: config.redis.server,
      },
    });

    this._redisClient.on('error', (error) => {
      console.error(error);
    });

    this._redisClient.connect();
  }

  async set(key, value, expirationInSecond = 3600) {
    await this._redisClient.set(key, value, {
      EX: expirationInSecond,
    });
  }

  async get(key) {
    const result = await this._redisClient.get(key);

    if (result === null) throw new Error('Cache not found.');

    return result;
  }

  delete(key) {
    return this._redisClient.del(key);
  }
}

module.exports = CacheService;
