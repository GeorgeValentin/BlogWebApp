const router = require('express').Router();
const { db } = require('../firebaseConfig');
const utils = require('../utils/utils');
const checkUserExists = require('../middleware/checkUserExists');
const checkBlogPostExists = require('../middleware/checkBlogPostExists');
const checkCommentExists = require('../middleware/checkCommentExists');
const auth = require('../middleware/auth');

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
  // -> add a comment to a blog post that is (TBD - not of the post of the logged in user)
  // -> the logged in user should add comments to other people's posts
  .post(auth, checkUserExists, checkBlogPostExists, async (req, res) => {
    const loggedInUser = req.user;
    const { userId, blogPostId } = req.params;
    const commentToAdd = req.body;

    const commentsCollection = db.collection('comments');

    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    let userData = userDoc.data();

    const blogPostDocRef = db.collection('blogPosts').doc(blogPostId);
    const blogPostDoc = await blogPostDocRef.get();
    let blogPostData = blogPostDoc.data();

    console.log('Logged In User:', loggedInUser.userId);
    commentToAdd.authorId = loggedInUser.userId;
    commentToAdd.blogPostId = blogPostId;

    const addedComment = await commentsCollection.add(commentToAdd);
    commentToAdd.commentId = addedComment.id;
    await commentsCollection.doc(commentToAdd.commentId).update(commentToAdd);

    blogPostData.comments.push(commentToAdd);
    await blogPostDocRef.update({ comments: blogPostData.comments });

    const blogPostIndex = userData.blogPosts.findIndex(
      (blogPost) => blogPost.blogPostId === blogPostId
    );

    // for (const comment of userData.blogPosts[blogPostIndex].comments) {
    //     if (comment.commentId === commentId) {
    //       comment.content = commentToUpdate.content;
    //     }
    //   }
    console.log(commentToAdd);

    if (blogPostIndex != -1) {
      userData.blogPosts[blogPostIndex].comments.push(commentToAdd);
    }
    await userDocRef.update({ blogPosts: userData.blogPosts });

    return res.status(200).json(commentToAdd);
  });

router
  // -> get a comment by id of blog post of logged in user
  .route('/users/:userId/blogPosts/:blogPostId/comments/:commentId')
  .get(
    checkUserExists,
    checkBlogPostExists,
    checkCommentExists,
    async (req, res) => {
      const { userId, blogPostId, commentId } = req.params;
      let response = [];
      const commentsCollection = db
        .collection('comments')
        .where('userId', '==', userId)
        .where('blogPostId', '==', blogPostId)
        .where('commentId', '==', commentId);

      await commentsCollection
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            if (doc.id === commentId) response.push(doc.data());
          });
        })
        .catch((error) => {
          console.log('Error getting documents: ', error);
        });

      return res.status(200).json(response);
    }
  )
  // -> update comments made to other people's blog posts
  .put(
    checkUserExists,
    checkBlogPostExists,
    checkCommentExists,
    async (req, res) => {
      const commentToUpdate = req.body;
      const { userId, blogPostId, commentId } = req.params;

      const commentsCollection = db.collection('comments');
      const commentDocRef = commentsCollection.doc(commentId);
      const commentData = (await commentDocRef.get()).data();

      const blogPostsCollection = db.collection('blogPosts');
      const blogPostDocRef = blogPostsCollection.doc(blogPostId);
      const blogPostData = (await blogPostDocRef.get()).data();

      const usersCollection = db.collection('users');
      const userDocRef = usersCollection.doc(userId);
      const userData = (await userDocRef.get()).data();

      // -> update the "comments" collection
      commentData.content = commentToUpdate.content;
      await commentDocRef.update(commentData);

      // -> update the "blogPosts" collection
      for (const comment of blogPostData.comments) {
        if (comment.commentId === commentId) {
          comment.content = commentToUpdate.content;
        }
      }
      await blogPostDocRef.update({ comments: blogPostData.comments });

      // -> update the "users" collection
      const blogPostIndex = userData.blogPosts.findIndex(
        (blogPost) => blogPost.blogPostId === blogPostId
      );

      for (const comment of userData.blogPosts[blogPostIndex].comments) {
        if (comment.commentId === commentId) {
          comment.content = commentToUpdate.content;
        }
      }

      await userDocRef.update({ blogPosts: userData.blogPosts });

      res.status(200).json({
        message: `The comment with id {${commentId}} has been updated!`,
      });
    }
  );
//   .delete(checkUserExists, checkBlogPostExists, async (req, res) => {
//     const { userId, blogPostId, commentId } = req.params;
//     let response = [];
//     const commentsCollection = db
//       .collection('comments')
//       .where('userId', '==', userId)
//       .where('blogPostId', '==', blogPostId);

//     await commentsCollection
//       .get()
//       .then((querySnapshot) => {
//         querySnapshot.forEach((doc) => {
//           if (doc.id === commentId) response.push(doc.data());
//         });
//       })
//       .catch((error) => {
//         console.log('Error getting documents: ', error);
//       });

//     return res.status(200).json(response);
//   });

module.exports = router;
