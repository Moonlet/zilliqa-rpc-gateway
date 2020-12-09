const fs = require("fs");
const path = require("path");
const Joi = require("@hapi/joi");
const Log = require("./logger");

const CONFIG_FILE = process.argv[2];

if (!CONFIG_FILE) {
  throw new Error(`Config file param is mandatory.`);
}

const CONFIG_FILE_PATH = path.resolve(CONFIG_FILE);
if (!fs.existsSync(CONFIG_FILE_PATH)) {
  throw new Error(`Config file ${CONFIG_FILE} could not be found.`);
}
const CONFIG = require(CONFIG_FILE_PATH);

const CONFIG_SCHEMA = Joi.object({
  endpoints: Joi.object({
    api: Joi.string().uri().required(),
    raw: Joi.string().uri().required(),
  }).required(),
  rateLimit: Joi.object({
    ipHeader: Joi.string().required(),
    noLimitApiKeys: Joi.array().items(Joi.string()).required(),
  }).required(),
  redis: Joi.object({
    connectionName: Joi.string().required(),
    host: Joi.string().required(),
    port: Joi.number().max(65535).min(1024).required(),
    connectTimeout: Joi.number().positive().required(),
    maxRetriesPerRequest: Joi.number().min(1).required(),
  }).required(),
  logger: Joi.object({
    name: Joi.string().required(),
    level: Joi.string().valid("debug", "info", "warn", "error"),
    prettyPrint: Joi.boolean(),
  }).required(),
}).required();

const validation = CONFIG_SCHEMA.validate(CONFIG);
if (validation.error) {
  throw new Error(validation.error);
}

Log.configure(CONFIG.logger);
Log.info("Loaded config from %s", CONFIG_FILE_PATH);

module.exports = {
  CONFIG,
};
