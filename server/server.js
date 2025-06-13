const express = require("express");
const cors = require("cors");
const { createClient } = require('redis');
const db = require('./models');
require("dotenv").config();

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:5173',
  ], // vite server
};

// Redis
const redisClient = createClient({
  url: process.env.REDIS_URL
});

(async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Redis connection error:', err);
  }
})();
// module.exports.redisClient = redisClient;

app.use(cors(corsOptions));
app.use(express.json()); 

// Routes
const notesRouter = require('./routes/notes');
app.use('/api/notes', notesRouter);

app.get('/api', (req, res) => {
  res.json({'message': 'API is running'});
});

const PORT = process.env.PORT || 8080;

// Sync db and start server
db.sequelize.sync({ alter: true }).then(() => {
  console.log("Database synced.");
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to sync database:", err);
});