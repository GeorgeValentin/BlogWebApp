const router = require("express").Router();
const { db } = require("../firebaseConfig");
const generateData = require("../utils/dataGen");
const utils = require("../utils/utils");
const checkUser = require("../middleware/checkUser");
const checkBlogPost = require("../middleware/checkBlogPost");
const auth = require("../middleware/auth");

router.route("/allBlogPosts").get(async (req, res) => {
  try {
    const blogPostsCollection = db.collection("blogPosts");
    const usersCollection = db.collection("users");
    let blogPostsDocs = await blogPostsCollection.get();
    let response = [];

    const blogPostsArray = blogPostsDocs.docs.map(async (blogPostDoc) => {
      const blogPostDocData = blogPostDoc.data();

      const userDocRef = usersCollection.doc(blogPostDocData.authorId);
      const userDoc = await userDocRef.get();
      const userDocData = userDoc.data();

      const { ...blogPostCopy } = blogPostDocData;

      const blogPostWithAuthorName = {
        ...blogPostCopy,
        authorName: userDocData.username,
      };

      return blogPostWithAuthorName;
    });

    // Wait for all promises to resolve
    response = await Promise.all(blogPostsArray);

    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// -> get the blog posts of other users (DONE)
// -> needed so that we can comment on other user's posts
router
  .route("/users/:userId/blogPostsOfOthers")
  .get(checkUser, async (req, res) => {
    try {
      const userId = req.params.userId;

      const blogPostsCollection = db.collection("blogPosts");
      const usersCollection = db.collection("users");

      let blogPostsDocs = await blogPostsCollection.get();
      let response = [];

      const blogPostsArray = blogPostsDocs.docs.map(async (blogPostDoc) => {
        const blogPostDocData = blogPostDoc.data();

        if (blogPostDocData.authorId !== userId) {
          const userDocRef = usersCollection.doc(blogPostDocData.authorId);
          const userDoc = await userDocRef.get();
          const userDocData = userDoc.data();
          const { ...blogPostCopy } = blogPostDocData;

          const blogPostWithAuthorName = {
            ...blogPostCopy,
            authorName: userDocData.username,
          };

          return blogPostWithAuthorName;
        }
      });

      // Wait for all promises to resolve
      response = await Promise.all(blogPostsArray);

      // Filter out null & undefined values
      const filteredResponse = response.filter(
        (elem) => elem !== null && elem !== undefined
      );

      return res.status(200).json(filteredResponse);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  });

router
  // -> all blog posts of logged in user (DONE)
  .route("/users/:userId/blogPosts")
  .get(checkUser, async (req, res) => {
    try {
      const userId = req.params.userId;
      const blogPostsCollection = db.collection("blogPosts");
      let response = [];
      let blogPostsArrCopy = [];

      // -> if the blogPosts of the loggedIn user have no docs then randomly generate them with chance.js
      // => 3 records generated
      if (req.userDocData.blogPosts.length === 0) {
        const blogPostsArray = Array.from(
          { length: 3 },
          generateData.generateBlogPost
        );

        const categoriesArray = Array.from(
          { length: 3 },
          generateData.generateCategory
        );

        for (let blogPost of blogPostsArray) {
          blogPost.authorId = userId;
          const randomCategoryValue =
            categoriesArray[utils.randomizeArray(3)].category;
          blogPost.category = randomCategoryValue;

          const addedBlogPost = await blogPostsCollection.add(blogPost);
          blogPost.blogPostId = addedBlogPost.id;
          blogPost.comments = [];

          await blogPostsCollection.doc(addedBlogPost.id).update(blogPost);
        }

        for (let blogPost of blogPostsArray) {
          const { ...blogPostCopy } = blogPost;

          const blogPostWithAuthorName = {
            ...blogPostCopy,
            authorName: req.userDocData.username,
          };

          blogPostsArrCopy.push(blogPostWithAuthorName);
        }

        // 1. storing blogPosts array inside the user
        req.userDocRef.update({ blogPosts: blogPostsArray });

        response = blogPostsArrCopy;
      } else {
        // Retrieve and filter blog posts for the user
        const blogPostsQuerySnapshot = await blogPostsCollection
          .where("authorId", "==", userId)
          .get();
        blogPostsQuerySnapshot.forEach((blogPostDoc) => {
          const blogPostDocData = blogPostDoc.data();

          const { ...blogPostCopy } = blogPostDocData;

          const blogPostWithAuthorName = {
            ...blogPostCopy,
            authorName: req.userDocData.username,
          };

          response.push(blogPostWithAuthorName);
        });
      }

      return res.status(200).json(response);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  })
  // -> add a blog post (DONE)
  .post(auth, checkUser, async (req, res) => {
    try {
      const blogPostToAdd = req.body;

      if (
        blogPostToAdd.title === undefined ||
        blogPostToAdd.content === undefined ||
        blogPostToAdd.category === undefined
      ) {
        return res.status(400).json({
          message:
            "Cannot add blog post! Please provide all the necessary information!",
        });
      }

      const userId = req.params.userId;
      const loggedInUser = req.user;

      if (loggedInUser.userId !== userId) {
        return res.status(401).json({
          message:
            "Cannot add blog post! You are trying to add a blog post to someone else's list!",
        });
      }

      const blogPostsCollection = db.collection("blogPosts");

      blogPostToAdd.authorId = userId;
      blogPostToAdd.comments = [];
      blogPostToAdd.lastModifiedAt = new Date().toLocaleDateString();

      const addedBlogPost = await blogPostsCollection.add(blogPostToAdd);
      blogPostToAdd.blogPostId = addedBlogPost.id;
      await blogPostsCollection.doc(addedBlogPost.id).update(blogPostToAdd);

      req.userDocData.blogPosts.push(blogPostToAdd);

      await req.userDocRef.update({ blogPosts: req.userDocData.blogPosts });

      return res.status(200).json(blogPostToAdd);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  });

router
  .route("/users/:userId/blogPosts/:blogPostId")
  // -> get blog post by id (DONE)
  .get(checkUser, checkBlogPost, async (req, res) => {
    const { ...blogPostCopy } = req.blogPostDocData;

    const blogPostWithAuthorName = {
      ...blogPostCopy,
      authorName: req.userDocData.username,
    };

    return res.status(200).json(blogPostWithAuthorName);
  })
  // -> update blog post (DONE)
  .put(auth, checkUser, checkBlogPost, async (req, res) => {
    const { blogPostId, userId } = req.params;
    const loggedInUser = req.user;

    if (loggedInUser.userId !== userId) {
      return res.status(401).json({
        message: "Cannot update blog post! You are not the owner of the post!",
      });
    }

    const blogPostToUpdate = req.body;

    if (
      blogPostToUpdate.title === undefined ||
      blogPostToUpdate.title === null ||
      blogPostToUpdate.title === "" ||
      blogPostToUpdate.content === undefined ||
      blogPostToUpdate.content === null ||
      blogPostToUpdate.content === "" ||
      blogPostToUpdate.category === undefined ||
      blogPostToUpdate.category === null ||
      blogPostToUpdate.category === ""
    ) {
      return res.status(400).json({
        message:
          "Cannot update blog post! Please provide all the necessary information!",
      });
    }

    req.blogPostDocData.title = blogPostToUpdate.title;
    req.blogPostDocData.content = blogPostToUpdate.content;
    req.blogPostDocData.category = blogPostToUpdate.category;
    req.blogPostDocData.lastModifiedAt = new Date().toLocaleDateString();

    await req.blogPostDocRef.update(req.blogPostDocData);

    for (const blogPost of req.userDocData.blogPosts) {
      if (blogPost.blogPostId === blogPostId) {
        blogPost.content = blogPostToUpdate.content;
        blogPost.title = blogPostToUpdate.title;
        blogPost.category = blogPostToUpdate.category;
        blogPost.lastModifiedAt = new Date().toLocaleDateString();
      }
    }
    await req.userDocRef.update({ blogPosts: req.userDocData.blogPosts });

    return res.status(200).json({
      message: `The blog post with id {${blogPostId}} has been updated!`,
    });
  })
  // -> delete a post with a specific user id (DONE - to be updated after adding the "comments" collection)
  .delete(auth, checkUser, checkBlogPost, async (req, res) => {
    const { userId, blogPostId } = req.params;
    const loggedInUser = req.user;

    if (loggedInUser.userId !== userId) {
      return res.status(401).json({
        message: "Cannot delete blog post! You are not the owner of the post!",
      });
    }

    const commentsCollection = db.collection("comments");
    const commentsDocs = await commentsCollection.get();

    // -> check if the loggedIn user is the same with the owner of the blog post
    if (loggedInUser.userId === userId) {
      if (req.blogPostDocData.comments.length !== 0) {
        // remove comments from the table
        commentsDocs.forEach(async (commentDoc) => {
          const commentDocData = commentDoc.data();

          await commentsCollection.doc(commentDocData.commentId).delete();

          let blogPostComments = req.blogPostDocData.comments;

          blogPostComments = blogPostComments.filter(
            (blogPostComment) => blogPostComment.blogPostId !== blogPostId
          );

          await req.blogPostDocRef.update({ comments: blogPostComments });
        });
      }
    } else {
      return res.status(401).json({
        message: `You do not have the right to delete someone else's post!`,
      });
    }

    // -> update the users array of blogPosts
    let userBlogPosts = req.userDocData.blogPosts;

    // -> remove the blog post from the users collection
    userBlogPosts = userBlogPosts.filter(
      (userBlogPost) => userBlogPost.blogPostId !== blogPostId
    );

    // -> update the "users" collection to not include that blog post
    await req.userDocRef.update({ blogPosts: userBlogPosts });

    // -> remove the blog post from the "blogPosts" collection
    await req.blogPostDocRef.delete();

    return res.status(200).json({
      message: `The blog post with id {${blogPostId}} deleted succesfully together with all its comments!`,
    });
  });

module.exports = router;
