// -> ajuta la prevenirea anumitor erori (ex: fiecare parametru trebuie sa aiba nume unic)
("use strict");

const express = require("express");
const cors = require("cors");

const serverPort = 8000;
const app = express();

// -> asteapta sa primeasca in request.body date in format JSON
app.use(express.json());

// -> utilizeaza pachetul cors = pachet care permite aplicatiei client UI (vue js), care ruleaza pe un anumit port,
// sa acceseze resursele de pe server (aplicatia de fata, creata cu express.js), care ruleaza pe un alt server
app.use(cors());

// -> adaugarea rutelor in aplicatie
app.use("/authentication", require("./routes/authentication"));
app.use("/api", require("./routes/blogPosts"));
app.use("/api", require("./routes/comments"));

// -> crearea seerverului de express.js
app.listen(serverPort, async () => {
  console.log(`Server started on port ${serverPort}`);
});
