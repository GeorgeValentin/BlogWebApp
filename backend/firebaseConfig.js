const { getFirestore } = require("firebase-admin/firestore");
var admin = require("firebase-admin");

var serviceAccount = require("./firebase_admin_key/blogapp-b3beb-firebase-adminsdk-58w8d-c3a5789657.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

module.exports.db = db;
