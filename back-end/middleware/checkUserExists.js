const { db } = require('../firebaseConfig');

const checkUserExists = async (req, res, next) => {
  const { userId } = req.params;
  const userDocRef = db.collection('users').doc(userId);

  try {
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = checkUserExists;
