// BullMQ needs an ioredis-compatible connection config object.
// Upstash URL format:  rediss://default:PASSWORD@HOST.upstash.io:6379
// Local Redis format:  redis://localhost:6379

const { URL } = require("url");

const getRedisConnection = () => {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const parsed = new URL(redisUrl);

  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 6379,
    // Upstash uses username "default", password is the token
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    // TLS required for Upstash (rediss://) — local Redis doesn't need it
    tls: parsed.protocol === "rediss:" ? {} : undefined,
    // BullMQ hard requirement: must be null (not 0 or undefined)
    maxRetriesPerRequest: null,
  };
};

module.exports = { getRedisConnection };
