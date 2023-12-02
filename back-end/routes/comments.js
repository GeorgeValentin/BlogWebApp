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
  })
  .post(checkUserExists, checkBlogPostExists, async (req, res) => {
    const { userId, blogPostId } = req.params;
    const commentToAdd = req.body;

    const commentsCollection = db.collection('comments');
    //   .where('userId', '==', userId)
    //   .where('blogPostId', '==', blogPostId);

    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    let userData = userDoc.data();

    const blogPostDocRef = db.collection('blogPosts').doc(blogPostId);
    const blogPostDoc = await blogPostDocRef.get();
    let blogPostData = blogPostDoc.data();

    commentToAdd.userId = userId;
    commentToAdd.blogPostId = blogPostId;

    const addedComment = await commentsCollection.add(commentToAdd);
    commentToAdd.commentId = addedComment.id;

    blogPostData.comments.push(commentToAdd);
    await blogPostDocRef.update({ comments: blogPostData.comments });

    const blogPostIndex = userData.blogPosts.findIndex(
      (blogPost) => blogPost.blogPostId === blogPostId
    );

    if (blogPostIndex != -1) {
      userData.blogPosts[blogPostIndex].comments.push(commentToAdd);
    }
    await userDocRef.update({ blogPosts: userData.blogPosts });

    return res.status(200).json(commentToAdd);
  });

module.exports = router;
