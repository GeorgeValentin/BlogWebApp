const router = require("express").Router();
const { db } = require("../firebaseConfig");
const generateData = require("../utils/dataGen");
const utils = require("../utils/utils");
const checkUser = require("../middleware/checkUser");
const auth = require("../middleware/auth");

router.route("/users/:userId").get(async (req, res) => {
  const userId = req.params.userId;
  const userDocRef = db.collection("users").doc(userId);
  const userDoc = await userDocRef.get();

  if (!userDoc.exists) {
    return res.status(404).json({ error: "User not found" });
  }

  const { email, username } = userDoc.data();
  const userData = { email, username };

  console.log(userData);
  res.status(200).json(userData);
});

module.exports = router;
