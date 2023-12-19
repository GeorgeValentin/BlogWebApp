("use strict");
const express = require("express");

const bodyParser = require("body-parser");
const serverPort = 8000;
const cors = require("cors");

const corsOptions = {
  origin: "http://localhost:8080",
};

const app = express();

app.use(express.json());
app.use(cors(corsOptions));

app.use("/authentication", require("./routes/authentication"));
app.use("/api", require("./routes/blogPosts"));
app.use("/api", require("./routes/comments"));
app.use("/api", require("./routes/users"));

app.listen(serverPort, async () => {
  console.log(`Server started on port ${serverPort}`);
});
