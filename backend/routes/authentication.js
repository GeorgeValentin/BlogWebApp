require("dotenv").config();
const router = require("express").Router();
const { db } = require("../firebaseConfig");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

// -> POST /register
router.route("/register").post(async (req, res) => {
  try {
    // -> extragem proprietatile obiectului primit in request.body
    const { username, email, password } = req.body;

    // colectia (array-ul) de blogPosts pe care il va avea fiecare utilizator inregistrat
    const blogPosts = [];

    // -> verificam ca proprietatile primite din request sa existe
    if (
      username === undefined ||
      email === undefined ||
      password === undefined
    ) {
      return res.status(400).json({ message: "Missing credentials!" });
    }

    // -> extragem toate documentele utilizatorilor existenti
    const users = await db.collection("users").get();

    // -> obiect care ne arata daca exista email-ul respectiv
    let success = true;

    // -> verificam daca mai exista vreun utilizator cu email-ul respectiv in baza de date
    for (let index = 0; index < users.docs.length; index++) {
      if (users.docs[index].data().email === email) {
        success = false;
        break;
      }
    }

    // -> daca nu exista email-ul
    if (success) {
      // -> aici vom face hash parolei
      // -> saltRounds = de cate ori se va executa algoritmul de "hash-uire"
      const hash = await bcrypt.hash(password, saltRounds);

      // -> creeaza utilizatorul in baza de date
      await db.collection("users").add({ username, email, hash, blogPosts });

      // -> utilizator adaugat - raspuns cu status: 200 OK si mesaj: "User added succesfully!"
      return res.status(200).json({ message: "User added succesfully!" });
    }
    // -> daca exista email-ul
    else {
      // -> utilizator neadaugat - raspuns cu status: 400 Bad Request si mesaj: "Email address already registered!"
      return res
        .status(400)
        .json({ message: "Email address already registered!" });
    }
  } catch (err) {
    // -> returnam Status 500 - Server error
    return res.status(500).json(err);
  }
});

// -> POST localhost:8080/authentication/login
router.route("/login").post(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === undefined || password === undefined)
      return res.status(400).json({ message: "Missing credentials!" });

    const users = await db.collection("users").get();
    let userToLogin;
    let loginResponse = {};

    // -> verifica daca email-ul adaugat este cel corect
    // -> cand gasim email-ul, vom pastra si id-ul si username-ul utilizatorului respectiv
    for (let index = 0; index < users.docs.length; index++) {
      if (users.docs[index].data().email === email) {
        userToLogin = users.docs[index].data();
        userToLogin.userId = users.docs[index].id;
        userToLogin.username = users.docs[index].data().username;
      }
    }

    // -> daca am gasit utilizatorul
    if (userToLogin) {
      // -> verificam daca parola coincide cu ce am hash-uit in momentul in care am inregistrat utiliatorul
      const validPass = await bcrypt.compare(password, userToLogin.hash);

      // -> parola corecta
      if (validPass) {
        // -> luam un secret din fisierul .env
        const serverSecret = process.env.MY_SECRET;

        // -> cream un obiect cu proprietatile de care avem nevoie
        const tokenPayload = {
          userId: userToLogin.userId,
          email: userToLogin.email,
          username: userToLogin.username,
        };

        // -> semnam token-ul folosind secretul = vom crea token-ul, care va contine datele din tokenPayload,
        // va avea nevoie de secret pentru a fi decodat si va expira in 1h
        let token = jwt.sign(tokenPayload, serverSecret, { expiresIn: "1h" });

        // -> adaugam proprietatile pe care le vom returna din aceasta functie
        let currentDate = new Date();
        loginResponse.username = userToLogin.username;
        loginResponse.userId = userToLogin.userId;
        loginResponse.token = token;
        loginResponse.message = "Logged in successfully!";
        loginResponse.expiresIn = "1h";
        loginResponse.expiry = new Date(currentDate).setHours(
          currentDate.getHours() + 1
        );

        // -> returnam 200 OK cu proprietatile setate anterior
        return res.status(200).json(loginResponse);
      }
      // -> returnam 404 NOT FOUND - "Wrong password"
      else return res.status(400).json({ message: "Wrong password!" });
    }
    // -> daca nu am gasit utilizatorul
    else {
      return res.status(404).json({ message: "The user does not exist!" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// -> exportam obiectul router
module.exports = router;
