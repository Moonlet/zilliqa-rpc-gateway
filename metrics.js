const promClient = require("prom-client");
const { CONFIG } = require("./config");
promClient.collectDefaultMetrics();
const Log = require("./logger");

// const reqCounter = new promClient.Counter({
//     name: 'http_request_count',
//     help: 'Http requests count',
//     labelNames: ['status', 'method', 'route', 'rpc_method']
// });
const routeHist = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "request duration in seconds",
  labelNames: ["status", "method", "route", "rpc_method"],
  buckets: [0.05, 0.1, 0.5, 1, 3, 5, 10],
});
const routeSum = new promClient.Summary({
  name: "http_request_summary_seconds",
  help: "request duration in seconds summary",
  labelNames: ["status", "method", "route", "rpc_method"],
  percentiles: [0.5, 0.9, 0.95, 0.99],
});

const setupMetrics = (fastify) => {
  fastify.addHook("onRequest", (request, _, next) => {
    if (request.raw.url) {
      request.metrics = {
        hist: routeHist.startTimer(),
        sum: routeSum.startTimer(),
      };
    }
    next();
  });
  fastify.addHook("onResponse", function (request, reply, next) {
    const context = reply.context;
    let route = context.config.url || request.raw.url;
    if (context.config.statsId) {
      route = context.config.statsId;
    }
    const method = (request.raw.method || "UNKNOWN").toUpperCase();

    let rpcMethod;
    if (request.raw.method.toUpperCase() === "POST") {
      rpcMethod =
        request.body &&
        request.body.hasOwnProperty &&
        request.body.hasOwnProperty("method")
          ? request.body.method
          : undefined;
    }

    // reqCounter.labels(reply.raw.statusCode, method, route, rpcMethod).inc();
    if (request.metrics) {
      request.metrics.sum({
        status: reply.raw.statusCode,
        method,
        route,
        rpc_method: rpcMethod,
      });
      request.metrics.hist({
        status: reply.raw.statusCode,
        method,
        route,
        rpc_method: rpcMethod,
      });
    }
    next();
  });

  const fastifyMetrics = require("fastify")({
    logger: Log.getChildLogger({ name: CONFIG.logger.name + "-metrics" }),
    bodyLimit: 100 * 1024, // 100Kb
    rewriteUrl: (req) => {
      return req.url;
    },
  });
  fastifyMetrics.route({
    url: "/metrics",
    method: "GET",
    schema: {
      // hide route from swagger plugins
      hide: true,
    },
    handler: (_, reply) => {
      const data = promClient.register.metrics();
      void reply.type("text/plain").send(data);
    },
  });
  // Run the server!
  fastifyMetrics.listen(
    CONFIG.listen.metrics.port,
    CONFIG.listen.metrics.ip,
    (err, address) => {
      if (err) throw err;
      fastify.log.info(`Metrics listening on ${address}/metrics`);
    }
  );
};

module.exports = {
  setupMetrics,
};
