const Redis = require("ioredis");
const { CONFIG } = require("./config");
const Log = require("./logger");

const redis = new Redis(CONFIG.redis);

redis.on("error", (err) => {
  Log.error(err);
});

const setupRateLimitation = (fastify) => {
  fastify.register(require("fastify-rate-limit"), {
    global: true,
    max: 200,
    timeWindow: "10 seconds",
    // skipOnError: true,
    keyGenerator: (req) => {
      return req.headers[CONFIG.rateLimit.ipHeader.toLowerCase()];
    },
    whitelist: (req) =>
      CONFIG.rateLimit.noLimitApiKeys.indexOf(req.query.apiKey) >= 0,
    redis,
  });
};

module.exports = {
  setupRateLimitation,
};
