const { Pool } = require('pg');
const { createClient } = require('redis');
const { pgConfig } = require('../config/config');

// create postgreSQL connection pool
const pool = new Pool(pgConfig);

// create redis client
const redisClient = createClient({
  url: process.env.REDIS_URL
});

// test redis connection
(async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Redis connection error:', err);
  }
})();

// test postgreSQL connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('PostgreSQL connection error:', err);
  } else {
    console.log('Connected to PostgreSQL');
  }
});

module.exports = {
  pool,
  redisClient
};