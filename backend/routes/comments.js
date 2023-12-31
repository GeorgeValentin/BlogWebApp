const router = require("express").Router();
const { db } = require("../firebaseConfig");
const utils = require("../utils/utils");
const checkUser = require("../middleware/checkUser");
const checkBlogPost = require("../middleware/checkBlogPost");
const checkComment = require("../middleware/checkComment");
const auth = require("../middleware/auth");

router
  // -> get all comments added to a blog post (including the logged in user's)
  .route("/blogPosts/:blogPostId/comments")
  .get(checkBlogPost, async (req, res) => {
    const { blogPostId } = req.params;
    let response = [];
    const commentsCollection = db
      .collection("comments")
      .where("blogPostId", "==", blogPostId);
    const usersCollection = db.collection("users");

    const commentsDocs = await commentsCollection.get();

    const commentsArray = commentsDocs.docs.map(async (commentDoc) => {
      const commentDocData = commentDoc.data();

      const userDocRef = usersCollection.doc(commentDocData.authorId);
      const userDoc = await userDocRef.get();
      const userDocData = userDoc.data();
      const { ...commentCopy } = commentDocData;

      const commentWithAuthorName = {
        ...commentCopy,
        authorName: userDocData.username,
      };

      return commentWithAuthorName;
    });
    response = await Promise.all(commentsArray);

    return res.status(200).json(response);
  });

router
  // -> get all comments added to a blog post (excluding the logged in user's)
  .route("/blogPostsWithoutLoggedIn/:blogPostId/comments")
  .get(auth, checkBlogPost, async (req, res) => {
    const { blogPostId } = req.params;
    const loggedInUserId = req.user.userId;

    const commentsCollection = db
      .collection("comments")
      .where("blogPostId", "==", blogPostId);
    const usersCollection = db.collection("users");

    const commentsDocs = await commentsCollection.get();
    let response = [];

    const commentsArray = commentsDocs.docs.map(async (commentDoc) => {
      const commentDocData = commentDoc.data();

      if (commentDocData.authorId !== loggedInUserId) {
        const userDocRef = usersCollection.doc(commentDocData.authorId);
        const userDoc = await userDocRef.get();
        const userDocData = userDoc.data();

        const { ...commentCopy } = commentDocData;

        const commentWithAuthorName = {
          ...commentCopy,
          authorName: userDocData.username,
        };

        return commentWithAuthorName;
      }
    });
    response = await Promise.all(commentsArray);

    // Filter out null & undefined values
    const filteredResponse = response.filter(
      (elem) => elem !== null && elem !== undefined
    );

    return res.status(200).json(filteredResponse);
  });

router
  .route("/users/:userId/blogPosts/:blogPostId/comments")
  // -> add a comment to a blog post of some other user (not to the same that is logged in)
  .post(auth, checkUser, checkBlogPost, async (req, res) => {
    if (
      req.body.content === undefined ||
      req.body.content === null ||
      req.body.content === ""
    ) {
      return res.status(400).json({
        message: "Cannot add an empty comment! Please try again!",
      });
    }

    const loggedInUser = req.user;
    const { userId, blogPostId } = req.params;
    const commentToAdd = req.body;

    // -> we don't want the creator of the blogPost to be able to comment on his own post
    if (loggedInUser.userId === userId) {
      console.log("HIT");
      return res.status(401).json({
        message: "Cannot add comment! You are the owner of the post!",
      });
    }

    const commentsCollection = db.collection("comments");

    commentToAdd.authorId = loggedInUser.userId;
    commentToAdd.blogPostId = blogPostId;
    commentToAdd.lastModifiedAt = new Date().toLocaleDateString();

    const addedComment = await commentsCollection.add(commentToAdd);
    commentToAdd.commentId = addedComment.id;
    await commentsCollection.doc(commentToAdd.commentId).update(commentToAdd);

    req.blogPostDocData.comments.push(commentToAdd);
    await req.blogPostDocRef.update({ comments: req.blogPostDocData.comments });

    const blogPostIndex = req.userDocData.blogPosts.findIndex(
      (blogPost) => blogPost.blogPostId === blogPostId
    );

    if (blogPostIndex != -1) {
      req.userDocData.blogPosts[blogPostIndex].comments.push(commentToAdd);
    }
    await req.userDocRef.update({ blogPosts: req.userDocData.blogPosts });

    return res.status(200).json(commentToAdd);
  });

router
  // -> get a comment of a blog post by its id (of any user)
  .route("/blogPosts/:blogPostId/comments/:commentId")
  .get(checkBlogPost, checkComment, async (req, res) => {
    const { blogPostId, commentId } = req.params;

    let response = [];
    const commentsCollection = db
      .collection("comments")
      .where("blogPostId", "==", blogPostId)
      .where("commentId", "==", commentId);

    await commentsCollection
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.id === commentId) response.push(doc.data());
        });
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });

    return res.status(200).json(response);
  })
  // -> update comments made to other people's blog posts
  .put(auth, checkComment, checkUser, checkBlogPost, async (req, res) => {
    const commentToUpdate = req.body;
    const { userId, blogPostId, commentId } = req.params;
    const loggedInUser = req.user;

    // -> we only want the owner of the comment to be able to update it
    if (loggedInUser.userId === userId) {
      return res
        .status(401)
        .json({ message: "Cannot update comment! The owner has to log in!" });
    }

    // -> update the "comments" collection
    req.commentDocData.content = commentToUpdate.content;
    req.commentDocData.lastModifiedAt = new Date().toLocaleDateString();

    await req.commentDocRef.update(req.commentDocData);

    // -> update the "blogPosts" collection
    for (const comment of req.blogPostDocData.comments) {
      if (comment.commentId === commentId) {
        comment.content = commentToUpdate.content;
        comment.lastModifiedAt = new Date().toLocaleDateString();
      }
    }
    await req.blogPostDocRef.update({ comments: req.blogPostDocData.comments });

    // -> update the "users" collection
    const blogPostIndex = req.userDocData.blogPosts.findIndex(
      (blogPost) => blogPost.blogPostId === blogPostId
    );

    if (blogPostIndex === -1) {
      res.status(400).json({
        message: `The blog post and the comment are not related!`,
      });
    }

    for (const comment of req.userDocData.blogPosts[blogPostIndex].comments) {
      if (comment.commentId === commentId) {
        comment.content = commentToUpdate.content;
      }
    }

    await req.userDocRef.update({ blogPosts: req.userDocData.blogPosts });

    res.status(200).json({
      message: `The comment with id {${commentId}} has been updated!`,
    });
  })
  .delete(auth, checkComment, checkUser, checkBlogPost, async (req, res) => {
    const { userId, blogPostId, commentId } = req.params;
    const loggedInUser = req.user;

    // -> we only want the owner of the comment to be able to delete it
    if (loggedInUser.userId === userId) {
      return res
        .status(401)
        .json({ message: "Cannot delete comment! The owner has to log in!" });
    }

    // -> delete the comment from the "comments" collection
    await req.commentDocRef.delete();

    // -> delete the comment from the "blogPosts" collection
    let blogPostComments = req.blogPostDocData.comments;

    blogPostComments = blogPostComments.filter(
      (blogPostComment) => blogPostComment.commentId !== commentId
    );

    await req.blogPostDocRef.update({ comments: blogPostComments });

    // -> delete the comment from the blogPosts array of the "users" collection
    const blogPostIndex = req.userDocData.blogPosts.findIndex(
      (blogPost) => blogPost.blogPostId === blogPostId
    );

    if (blogPostIndex === -1) {
      return res.status(404).json({ message: "Blog post not found!" });
    }

    const updatedBlogPostsArray = [...req.userDocData.blogPosts];
    const updatedCommentsArray =
      updatedBlogPostsArray[blogPostIndex].comments || [];
    const updatedComments = updatedCommentsArray.filter(
      (comment) => comment.commentId !== commentId
    );

    updatedBlogPostsArray[blogPostIndex].comments = updatedComments;

    await req.userDocRef.update({ blogPosts: updatedBlogPostsArray });

    return res.status(200).json({
      message: `The comment with id {${commentId}} has been deleted!`,
    });
  });

module.exports = router;
