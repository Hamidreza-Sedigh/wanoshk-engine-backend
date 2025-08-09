// config/index.js
require('dotenv-flow').config(); // فقط یک بار لود بشه

const ENV = process.env.NODE_ENV || 'development';

const config = {
  env: ENV,

  app: {
    port: process.env.PORT || 8080,
    host: process.env.API_HOST || `http://localhost:${process.env.PORT || 8080}`
  },

  db: {
    uri: process.env.DB_URI
  },

  log: {
    level: process.env.LOG_LEVEL || 'info'
  },

  features: {
    enableCoolFeature: process.env.ENABLE_COOL_FEATURE === 'true'
  }
};

module.exports = config;
