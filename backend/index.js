("use strict");
const express = require("express");

const serverPort = 8000;
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/authentication", require("./routes/authentication"));
app.use("/api", require("./routes/blogPosts"));
app.use("/api", require("./routes/comments"));

app.listen(serverPort, async () => {
  console.log(`Server started on port ${serverPort}`);
});
