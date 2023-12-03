const router = require('express').Router();
const { db } = require('../firebaseConfig');
const generateData = require('../utils/dataGen');
const utils = require('../utils/utils');
const checkUserExists = require('../middleware/checkUserExists');
const checkBlogPostExists = require('../middleware/checkBlogPostExists');
const auth = require('../middleware/auth');

// -> get the blog posts of other users (DONE)
// -> needed so that we can comment on other user's posts
router
  .route('/users/:userId/blogPostsOfOthers')
  .get(checkUserExists, async (req, res) => {
    try {
      const userId = req.params.userId;
      const blogPostsCollection = db.collection('blogPosts');

      let blogPostsDocs = await blogPostsCollection.get();

      let response = [];

      blogPostsDocs.forEach((blogPostDoc) => {
        const blogPostDocData = blogPostDoc.data();

        if (blogPostDocData.author !== userId) response.push(blogPostDocData);
      });

      return res.status(200).json(response);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  });

router
  // -> all blog posts of user (DONE)
  .route('/users/:userId/blogPosts')
  .get(checkUserExists, async (req, res) => {
    try {
      const userId = req.params.userId;

      const blogPostsCollection = db.collection('blogPosts');
      const usersCollection = db.collection('users');
      const usersDocRef = usersCollection.doc(userId);
      const usersDoc = await usersDocRef.get();

      let response = [];

      // -> if the blogPosts of the loggedIn user have no docs then randomly generate them with chance.js
      // => 3 records generated
      if (usersDoc.data().blogPosts.length === 0) {
        const blogPostsArray = Array.from(
          { length: 3 },
          generateData.generateBlogPost
        );

        const categoriesArray = Array.from(
          { length: 3 },
          generateData.generateCategory
        );

        for (let blogPost of blogPostsArray) {
          blogPost.author = userId;
          blogPost.category = categoriesArray[utils.randomizeArray(3)];

          const addedBlogPost = await blogPostsCollection.add(blogPost);
          blogPost.blogPostId = addedBlogPost.id;
          blogPost.comments = [];

          await blogPostsCollection.doc(addedBlogPost.id).update(blogPost);
        }

        // 1. storing blogPosts array inside the user
        usersDocRef.update({ blogPosts: blogPostsArray });

        response = blogPostsArray;
      } else {
        // Retrieve and filter blog posts for the user
        const blogPostsQuerySnapshot = await blogPostsCollection
          .where('author', '==', userId)
          .get();
        blogPostsQuerySnapshot.forEach((blogPostDoc) => {
          const blogPostDocData = blogPostDoc.data();
          response.push(blogPostDocData);
        });
      }

      return res.status(200).json(response);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  })
  // -> add a blog post (DONE)
  .post(auth, checkUserExists, async (req, res) => {
    try {
      const blogPostToAdd = req.body;
      const userId = req.params.userId;
      const loggedInUser = req.user;

      if (loggedInUser.userId !== userId) {
        return res.status(401).json({
          message:
            "Cannot add blog post! You are trying to add a blog post to someone else's list!",
        });
      }

      const blogPostsCollection = db.collection('blogPosts');
      const usersCollection = db.collection('users');
      const userDocRef = usersCollection.doc(userId);
      const userDoc = await userDocRef.get();
      let userData = userDoc.data();

      blogPostToAdd.author = userId;
      blogPostToAdd.likes = 0;
      blogPostToAdd.comments = [];

      const addedBlogPost = await blogPostsCollection.add(blogPostToAdd);
      blogPostToAdd.blogPostId = addedBlogPost.id;
      await blogPostsCollection.doc(addedBlogPost.id).update(blogPostToAdd);

      userData.blogPosts.push(blogPostToAdd);

      await userDocRef.update({ blogPosts: userData.blogPosts });

      return res.status(200).json(blogPostToAdd);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  });

router
  .route('/users/:userId/blogPosts/:blogPostId')
  // -> get blog post by id (DONE)
  .get(checkUserExists, checkBlogPostExists, async (req, res) => {
    const blogPostId = req.params.blogPostId;
    const blogPostsCollection = db.collection('blogPosts');
    const blogPostDocRef = blogPostsCollection.doc(blogPostId);
    const blogPostDoc = await blogPostDocRef.get();

    res.status(200).json(blogPostDoc.data());
  })
  // -> update blog post (DONE)
  .put(auth, checkUserExists, checkBlogPostExists, async (req, res) => {
    const { blogPostId, userId } = req.params;
    const loggedInUser = req.user;

    if (loggedInUser.userId !== userId) {
      return res.status(401).json({
        message: 'Cannot update blog post! You are not the owner of the post!',
      });
    }

    const blogPostToUpdate = req.body;

    const blogPostDocRef = db.collection('blogPosts').doc(blogPostId);
    const blogPostDoc = await blogPostDocRef.get();
    let blogPostData = blogPostDoc.data();
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    let userData = userDoc.data();

    blogPostData.title = blogPostToUpdate.title;
    blogPostData.content = blogPostToUpdate.content;
    blogPostData.category = blogPostToUpdate.category;

    await blogPostDocRef.update(blogPostData);

    for (const blogPost of userData.blogPosts) {
      if (blogPost.blogPostId === blogPostId) {
        blogPost.content = blogPostToUpdate.content;
        blogPost.title = blogPostToUpdate.title;
        blogPost.category = blogPostToUpdate.category;
      }
    }
    await userDocRef.update({ blogPosts: userData.blogPosts });

    res.status(200).json({
      message: `The blog post with id ${blogPostId} has been updated!`,
    });
  })
  // -> delete a post with a specific user id (DONE - to be updated after adding the "comments" collection)
  .delete(auth, checkUserExists, checkBlogPostExists, async (req, res) => {
    const { userId, blogPostId } = req.params;
    const loggedInUser = req.user;

    if (loggedInUser.userId !== userId) {
      return res.status(401).json({
        message: 'Cannot delete blog post! You are not the owner of the post!',
      });
    }

    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();
    const blogPostDocRef = db.collection('blogPosts').doc(blogPostId);
    const blogPostDoc = await blogPostDocRef.get();
    const blogPostData = blogPostDoc.data();
    const commentsCollection = db.collection('comments');
    const commentsDocs = await commentsCollection.get();

    // -> check if the loggedIn user is the same with the owner of the blog post
    if (loggedInUser.userId === userId) {
      if (blogPostData.comments.length !== 0) {
        // remove comments from the table
        commentsDocs.forEach(async (commentDoc) => {
          const commentDocData = commentDoc.data();

          await commentsCollection.doc(commentDocData.commentId).delete();

          let blogPostComments = blogPostData.comments;

          blogPostComments = blogPostComments.filter(
            (blogPostComment) => blogPostComment.blogPostId !== blogPostId
          );

          await blogPostDocRef.update({ comments: blogPostComments });
        });
      }
    } else {
      return res.status(401).json({
        message: `You do not have the right to delete someone else's post!`,
      });
    }

    // -> update the users array of blogPosts
    let userBlogPosts = userData.blogPosts;

    // -> remove the blog post from the users collection
    userBlogPosts = userBlogPosts.filter(
      (userBlogPost) => userBlogPost.blogPostId !== blogPostId
    );

    // -> update the "users" collection to not include that blog post
    await userDocRef.update({ blogPosts: userBlogPosts });

    // -> remove the blog post from the "blogPosts" collection
    await blogPostDocRef.delete();

    return res.status(200).json({
      message: `The blog post with id {${blogPostId}} deleted succesfully together with all its comments!`,
    });
  });

module.exports = router;
