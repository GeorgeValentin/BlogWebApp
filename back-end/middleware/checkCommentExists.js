const { db } = require('../firebaseConfig');

const checkCommentExists = async (req, res, next) => {
  const { commentId } = req.params;
  const commentDocRef = db.collection('comments').doc(commentId);

  try {
    const commentDoc = await commentDocRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = checkCommentExists;
