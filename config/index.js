// config/index.js
require('dotenv-flow').config(); // فقط یک بار لود بشه

const ENV = process.env.NODE_ENV || 'development';

let dbUri;

if (process.env.DB_USER) {
  const user = process.env.DB_USER;
  const pass = encodeURIComponent(process.env.DB_PASS || '');
  dbUri = `mongodb://${user}:${pass}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
} else {
  dbUri = `mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`;
}

const config = {
  env: ENV,

  app: {
    port: process.env.PORT || 8080,
    host: process.env.API_HOST || `http://localhost:${process.env.PORT || 8080}`
  },

  db: {
    uri: dbUri + '?authSource=admin'
  },

  log: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

module.exports = config;
