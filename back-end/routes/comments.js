const router = require('express').Router();
const { response } = require('express');
const { db } = require('../firebaseConfig');
const generateData = require('../utils/dataGen');
const utils = require('../utils/utils');
const checkUserExists = require('../middleware/checkUserExists');
const checkBlogPostExists = require('../middleware/checkBlogPostExists');

router
  // -> get all comments of blog post of logged in user
  .route('/users/:userId/blogPosts/:blogPostId/comments')
  .get(checkUserExists, checkBlogPostExists, async (req, res) => {
    const { userId, blogPostId } = req.params;

    const commentsCollection = db
      .collection('comments')
      .where('userId', '==', userId)
      .where('blogPostId', '==', blogPostId);

    const commentDocs = await commentsCollection.get();
    let response = [];

    commentDocs.forEach((commentDoc) => {
      const commentDocData = commentDoc.data();

      response.push(commentDocData);
    });

    return res.status(200).json(response);
  });

module.exports = router;
