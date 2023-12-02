const { db } = require('../firebaseConfig');

const checkBlogPostExists = async (req, res, next) => {
  const { blogPostId } = req.params;
  const blogPostDocRef = db.collection('blogPosts').doc(blogPostId);

  try {
    const blogPostDoc = await blogPostDocRef.get();

    if (!blogPostDoc.exists) {
      return res.status(404).json({
        message: `The blog post with id {${blogPostId}} does not exist!`,
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = checkBlogPostExists;
