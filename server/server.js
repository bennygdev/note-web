const express = require("express");
const app = express();
const cors = require("cors");

const corsOptions = {
  origin: ['http://localhost:5173'], // vite server
};

require("dotenv").config();

app.use(cors(corsOptions));
app.use(express.json()); 

app.get('/api', (req, res) => {
  res.json({'fruits': ['apple', 'orange', 'banana']});
});

app.listen(8080, () => {
  console.log('Server started on port 8080');
});