const { db } = require("../firebaseConfig");

// -> acelasi lucru ca in fisierul checkBlogPost.js
const checkComment = async (req, res, next) => {
  const { commentId } = req.params;
  const commentDocRef = db.collection("comments").doc(commentId);

  try {
    const commentDoc = await commentDocRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: "Comment not found" });
    }

    req.commentsCollection = db.collection("comments");
    req.commentsDocs = await req.commentsCollection.get();
    req.commentDocRef = commentDocRef;
    req.commentDoc = commentDoc;
    req.commentDocData = commentDoc.data();
    next();
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = checkComment;
