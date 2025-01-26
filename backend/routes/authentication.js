require("dotenv").config();
const router = require("express").Router();
const { db } = require("../firebaseConfig");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

// -> POST /register
router.route("/register").post(async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const blogPosts = [];

    if (
      username === undefined ||
      email === undefined ||
      password === undefined
    ) {
      return res.status(400).json({ message: "Missing credentials!" });
    }

    const users = await db.collection("users").get();

    let success = true;

    for (let index = 0; index < users.docs.length; index++) {
      if (users.docs[index].data().email === email) {
        success = false;
        break;
      }
    }

    if (success) {
      const hash = await bcrypt.hash(password, saltRounds);

      await db.collection("users").add({ username, email, hash, blogPosts });

      return res.status(200).json({ message: "User added succesfully!" });
    } else {
      return res
        .status(400)
        .json({ message: "Email address already registered!" });
    }
  } catch (err) {
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

    for (let index = 0; index < users.docs.length; index++) {
      if (users.docs[index].data().email === email) {
        userToLogin = users.docs[index].data();
        userToLogin.userId = users.docs[index].id;
        userToLogin.username = users.docs[index].data().username;
      }
    }

    console.log("User: ", userToLogin);

    if (userToLogin) {
      const validPass = await bcrypt.compare(password, userToLogin.hash);

      if (validPass) {
        const serverSecret = process.env.MY_SECRET || "SomeSecretHere";
        console.log("HIT");

        console.log(serverSecret);

        const tokenPayload = {
          userId: userToLogin.userId,
          email: userToLogin.email,
          username: userToLogin.username,
        };

        let token = jwt.sign(tokenPayload, serverSecret, { expiresIn: "1h" });

        let currentDate = new Date();
        loginResponse.username = userToLogin.username;
        loginResponse.userId = userToLogin.userId;
        loginResponse.token = token;
        loginResponse.message = "Logged in successfully!";
        loginResponse.expiresIn = "1h";
        loginResponse.expiry = new Date(currentDate).setHours(
          currentDate.getHours() + 1
        );

        return res.status(200).json(loginResponse);
      } else return res.status(400).json({ message: "Wrong password!" });
    } else {
      return res.status(404).json({ message: "The user does not exist!" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

module.exports = router;
