const jwt = require("jsonwebtoken");
const config = process.env;

// -> Middleware = functie executata in ciclul de "request - response" al aplicatiei, se ocupa cu modificarea obiectelor
// de request si response, terminarea ciclului sau chemarea urmatorului middleware din cele adaugate in functia initiala
// -> Acesta se ocupa cu verificarea existentei token-ului, decordarea si adaugarea informatiilor relevante pe obiectul de request
const verifyToken = (req, res, next) => {
  // -> extrage togen-ul din header-ul request-ului
  const token = req.headers["authorization"];

  // -> daca token-ul nu exista returneaza raspuns cu statusul 403 (Forbidden) si mesajul "Please login first"
  if (!token) {
    return res.status(403).send("Please login first!");
  }

  try {
    // -> verifica daca token-ul a fost semnat cu secretul din fisierul .env, iar daca e asa, decodeaza obiectul codat in token
    const decoded = jwt.verify(token, config.MY_SECRET);

    // -> extrage proprietatile necesare de pe token intr-un obiect
    const userPayload = {
      userEmail: decoded.email,
      userId: decoded.userId,
      username: decoded.username,
    };

    // -> ataseaza obiectul pe request
    req.user = userPayload;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }

  // move to the next execution point
  return next();
};

// -> exportam middleware-ul
module.exports = verifyToken;
