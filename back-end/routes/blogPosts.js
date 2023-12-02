const router = require('express').Router();
const { response } = require('express');
const { db } = require('../firebaseConfig');
const generateData = require('../utils/dataGen');
const utils = require('../utils/utils');
const checkUserExists = require('../middleware/checkUserExists');
const checkBlogPostExists = require('../middleware/checkBlogPostExists');

// -> get the blog posts of other users (DONE)
router
  .route('/users/:userId/blogPostsOfOthers')
  .get(checkUserExists, async (req, res) => {
    try {
      const userId = req.params.userId;
      const blogPostsCollection = db
        .collection('blogPosts')
        .where('author', '==', userId);

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
      const commentsCollection = db.collection('comments');
      const usersDocRef = usersCollection.doc(userId);
      const blogPostsDocs = await blogPostsCollection.get();
      const usersDoc = await usersDocRef.get();

      let response = [];

      // -> if the blogPosts of the loggedIn user have no docs then randomly generate them with chance.js
      // (3) records generated
      if (usersDoc.data().blogPosts.length === 0) {
        // Firestore batch write for atomic updates
        const batch = db.batch();

        const blogPostsArray = Array.from(
          { length: 3 },
          generateData.generateBlogPost
        );

        const categoriesArray = Array.from(
          { length: 3 },
          generateData.generateCategory
        );

        for (const blogPost of blogPostsArray) {
          // -> each post will have 2 comments
          const commentsArray = Array.from(
            { length: 2 },
            generateData.generateComment
          );

          blogPost.author = userId;
          blogPost.category = categoriesArray[utils.randomizeArray(3)];
          blogPost.comments = commentsArray;

          // const addedBlogPost = await blogPostsCollection.add(blogPost);
          // blogPost.blogPostId = addedBlogPost.id;
          const addedBlogPostRef = blogPostsCollection.doc();
          batch.set(addedBlogPostRef, blogPost);

          // -> add the comments to the comments collection
          for (const commToAdd of commentsArray) {
            commToAdd.blogPostId = addedBlogPostRef.id;
            commToAdd.userId = userId;

            commentsCollection.add(commToAdd);
          }
        }

        // 1. storing blogPosts array inside the user
        // Update user document with the array of blog posts
        batch.update(usersDocRef, { blogPosts: blogPostsArray });

        // Commit the batch
        await batch.commit();

        response = blogPostsArray;
      } else {
        blogPostsDocs.forEach((blogPostDoc) => {
          const blogPostDocData = blogPostDoc.data();

          if (blogPostDocData.author === userId) response.push(blogPostDocData);
        });
      }

      // 2. Saving the reference of the blogPosts inside the user
      //   snapshot.forEach(async (blogPostDoc) => {
      //     const blogPostData = blogPostDoc.data();
      //     response.push(blogPostData);
      // const userDoc = db.collection('users').doc(userId);
      // await userDoc.update({
      //   [`blogPosts.${blogPostDoc.id}`]: true,
      // });
      //});

      return res.status(200).json(response);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  })
  // -> add a blog post (DONE)
  .post(checkUserExists, async (req, res) => {
    try {
      const blogPostToAdd = req.body;
      const userId = req.params.userId;

      const blogPostsCollection = db.collection('blogPosts');
      const usersCollection = db.collection('users');
      const userDocRef = usersCollection.doc(userId);
      const userDoc = await userDocRef.get();
      let userData = userDoc.data();

      console.log(userData);
      blogPostToAdd.author = userId;
      blogPostToAdd.likes = 0;
      blogPostToAdd.comments = [];

      const addedBlogPost = await blogPostsCollection.add(blogPostToAdd);
      blogPostToAdd.blogPostId = addedBlogPost.id;
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
  .put(checkUserExists, checkBlogPostExists, async (req, res) => {
    const { blogPostId, userId } = req.params;
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
  .delete(checkUserExists, checkBlogPostExists, async (req, res) => {
    const { userId, blogPostId } = req.params;
    console.log(blogPostId);
    console.log(userId);

    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();
    const blogPostDocRef = db.collection('blogPosts').doc(blogPostId);
    const blogPostDoc = await blogPostDocRef.get();
    const blogPostData = blogPostDoc.data();

    // -> uncomment when treating the "comments" collection
    // if (blogPostData.comments.length === 0) {

    if (blogPostData.userId !== userId)
      return res.status(400).json({
        message: `The blog post with id {${blogPostId}} does not belong to the user with id {${userId}}!`,
      });

    // -> deletes the blog post from the "blogPosts" collection
    await blogPostDocRef.delete();

    // -> update the users array of blogPosts
    let userBlogPosts = userData.blogPosts;

    // -> remove the blog post from the users collection
    userBlogPosts = userBlogPosts.filter(
      (userBlogPost) => userBlogPost.blogPostId !== blogPostId
    );

    await userDocRef.update({ blogPosts: userBlogPosts });
    // } else {
    // remove comments from the table
    // }

    return res.status(200).json({
      message: `The blog post with id {${blogPostId}} deleted succesfully together with all its comments!`,
    });
  });

module.exports = router;
