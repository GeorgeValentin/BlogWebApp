const { db } = require('../firebaseConfig');

const checkBlogPost = async (req, res, next) => {
  const { blogPostId } = req.params;

  if (!blogPostId || typeof blogPostId !== 'string') {
    return res.status(400).json({
      message: 'Invalid blogPostId provided',
    });
  }

  const blogPostDocRef = db.collection('blogPosts').doc(blogPostId);

  try {
    const blogPostDoc = await blogPostDocRef.get();

    if (!blogPostDoc.exists) {
      return res.status(404).json({
        message: `The blog post with id {${blogPostId}} does not exist!`,
      });
    }

    req.blogPostsCollection = db.collection('blogPosts');
    req.blogPostsDocs = await req.blogPostsCollection.get();
    req.blogPostDocRef = blogPostDocRef;
    req.blogPostDoc = blogPostDoc;
    req.blogPostDocData = blogPostDoc.data();
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = checkBlogPost;
