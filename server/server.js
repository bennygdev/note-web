const express = require("express");
const app = express();
const cors = require("cors");

const corsOptions = {
  origin: [
    'http://localhost:5173',
  ], // vite server
};

require("dotenv").config();

app.use(cors(corsOptions));
app.use(express.json()); 

const notesRouter = require('./routes/notes');
app.use('/api/notes', notesRouter);

app.get('/api', (req, res) => {
  res.json({'message': 'API is running'});
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('Server started on port 8080');
});