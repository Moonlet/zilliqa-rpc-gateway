const { CONFIG } = require("./config");
const Log = require("./logger");
const { setupMetrics } = require("./metrics");
const { setupRateLimitation } = require("./rate-limitation");
const { rpcProxy } = require("./rpc-proxy");

// Require the framework and instantiate it
const fastify = require("fastify")({
  logger: Log.getLogger(),
  bodyLimit: 100 * 1024, // 100Kb
  rewriteUrl: (req) => {
    return req.url;
  },
});

// metrics
setupMetrics(fastify);

// setup rate limitation
setupRateLimitation(fastify);

// Declare api route
fastify.post("/api", rpcProxy({ url: CONFIG.endpoints.api }));
fastify.post("/raw", rpcProxy({ url: CONFIG.endpoints.raw }));

// Run the server!
fastify.listen(CONFIG.listen.app.port, CONFIG.listen.app.ip, (err, address) => {
  if (err) throw err;
  fastify.log.info(`App server listening on ${address}`);
});
