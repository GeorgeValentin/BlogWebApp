('use strict');
const express = require('express');

// const bodyParser = require('body-parser');
const serverPort = 8000;
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/authentication', require('./routes/authentication'));
app.use('/api', require('./routes/blogPosts'));
app.use('/api', require('./routes/comments'));

app.listen(8000, async () => {
  console.log(`Server started on port ${serverPort}`);
});
