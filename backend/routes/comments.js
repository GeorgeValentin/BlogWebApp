const router = require("express").Router();
const { db } = require("../firebaseConfig");
const utils = require("../utils/utils");
const checkUser = require("../middleware/checkUser");
const checkBlogPost = require("../middleware/checkBlogPost");
const checkComment = require("../middleware/checkComment");
const auth = require("../middleware/auth");

router
  // GET /blogPosts/:blogPostId/comments
  // -> get all comments added to a blog post (including the logged in user's)
  .route("/blogPosts/:blogPostId/comments")
  .get(checkBlogPost, async (req, res) => {
    const { blogPostId } = req.params;
    let response = [];

    // -> colectia comentariilor blogPost-ului al carui id l-am primit in URL
    const commentsCollection = db
      .collection("comments")
      .where("blogPostId", "==", blogPostId);

    // -> toate referintele documentelor comentariilor blogPost-ului al carui id l-am primit in URL
    const commentsDocs = await commentsCollection.get();

    const usersCollection = db.collection("users");

    // -> parcurgem documentele comentariilor, si modificam fiecare comentariu sa include numele autorului
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

    // -> asteapta finalizarea executiei functiei map
    // = trebuie sa asteptam pentru ca se executa cod asincron (async/await), cod al carui executie poate dura foarte mult timp
    // si care daca ar fi scris ca si sincron, ar bloca complet interfata aplicatiei, cat asteapta dupa raspuns
    response = await Promise.all(commentsArray);

    return res.status(200).json(response);
  });

router
  // GET /blogPostsWithoutLoggedIn/:blogPostId/comments
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

      // -> aici vrem ca id-ul utilizatorului logat sa nu apartina comentariului
      // -> apoi doar adaugam numele utilizatorului unui nou obiect care contine informatiile comentariului si dupa il returnam
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

    const filteredResponse = response.filter(
      (elem) => elem !== null && elem !== undefined
    );

    return res.status(200).json(filteredResponse);
  });

router
  // GET /users/:userId/blogPosts/:blogPostId/comments
  // -> add a comment to a blog post of some other user (not to the same that is logged in)
  .route("/users/:userId/blogPosts/:blogPostId/comments")
  .post(auth, checkUser, checkBlogPost, async (req, res) => {
    // -> verificam ca datele primite in request body sa existe
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

    // -> nu vrem ca detinatorul blogPost-ului sa isi poata adauga singur comentarii
    if (loggedInUser.userId === userId) {
      return res.status(401).json({
        message: "Cannot add comment! You are the owner of the post!",
      });
    }

    const commentsCollection = db.collection("comments");

    // -> adauga comentariu in colectia comments din firestore
    // -> autorul comentariului va fi utilizatorul logat
    commentToAdd.authorId = loggedInUser.userId;
    commentToAdd.blogPostId = blogPostId;
    commentToAdd.lastModifiedAt = new Date().toLocaleDateString();

    const addedComment = await commentsCollection.add(commentToAdd);
    commentToAdd.commentId = addedComment.id;
    await commentsCollection.doc(commentToAdd.commentId).update(commentToAdd);

    // -> actualizeaza documentul blogPostului cu noul comentariu
    req.blogPostDocData.comments.push(commentToAdd);
    await req.blogPostDocRef.update({ comments: req.blogPostDocData.comments });

    // -> cauta index-ul blogPostului din array-ul blogPosturilor din documentul userului
    const blogPostIndex = req.userDocData.blogPosts.findIndex(
      (blogPost) => blogPost.blogPostId === blogPostId
    );

    // -> daca indexul e gasit, adaugam comentariul in document
    if (blogPostIndex != -1) {
      req.userDocData.blogPosts[blogPostIndex].comments.push(commentToAdd);
    }

    // -> actualizam documentul utilizatorului
    await req.userDocRef.update({ blogPosts: req.userDocData.blogPosts });

    return res.status(200).json(commentToAdd);
  });

router
  // GET /blogPosts/:blogPostId/comments/:commentId
  // -> get a comment of a blog post by its id (of any user)
  .route("/blogPosts/:blogPostId/comments/:commentId")
  .get(checkBlogPost, checkComment, async (req, res) => {
    const { blogPostId, commentId } = req.params;

    let response = [];
    const commentsCollection = db
      .collection("comments")
      .where("blogPostId", "==", blogPostId)
      .where("commentId", "==", commentId);

    // -> cod asincron, similar cu async/await
    // -> diferenta e ca aici folosim .then(), care asteapta dupa raspunsul primit de la functia .get()
    // iar apoi foloseste raspunsul - querySnapshot in urmatoarea parte de executie
    await commentsCollection
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          // -> cautam comentariul in document
          if (doc.id === commentId) response.push(doc.data());
        });
      })
      .catch((error) => {
        console.log("Error getting document: ", error);
      });

    return res.status(200).json(response);
  });

router
  // PUT /users/:userId/blogPosts/:blogPostId/comments/:commentId
  // -> update comments made to other people's blog posts
  .route("/users/:userId/blogPosts/:blogPostId/comments/:commentId")
  .put(auth, checkComment, checkUser, checkBlogPost, async (req, res) => {
    const commentToUpdate = req.body;
    const { userId, blogPostId, commentId } = req.params;
    const loggedInUser = req.user;

    // -> vrem ca detinatorul comentariului sa poata actualiza comentariul
    if (loggedInUser.userId === userId) {
      return res
        .status(401)
        .json({ message: "Cannot update comment! The owner has to log in!" });
    }

    // -> actualizeaza comentariul
    req.commentDocData.content = commentToUpdate.content;
    req.commentDocData.lastModifiedAt = new Date().toLocaleDateString();

    await req.commentDocRef.update(req.commentDocData);

    // -> actualizeaza documentul blogPosts din care face parte comentariul
    for (const comment of req.blogPostDocData.comments) {
      if (comment.commentId === commentId) {
        comment.content = commentToUpdate.content;
        comment.lastModifiedAt = new Date().toLocaleDateString();
      }
    }

    await req.blogPostDocRef.update({ comments: req.blogPostDocData.comments });

    // -> actualizeaza documentul utilizatorului
    // -> extrage index-ul blogPost-ului din array-ul blogPost-urilor in documentul utilizatorului
    const blogPostIndex = req.userDocData.blogPosts.findIndex(
      (blogPost) => blogPost.blogPostId === blogPostId
    );

    // -> daca e = -1 atunci blogPost-ul nu contine comentariul respectiv
    if (blogPostIndex === -1) {
      res.status(400).json({
        message: `The blog post and the comment are not related!`,
      });
    }

    // -> parcurgem array-ul comentariilor din blogPost-ul din documentul utilizatorului
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
  // DELETE /users/:userId/blogPosts/:blogPostId/comments/:commentId
  .delete(auth, checkComment, checkUser, checkBlogPost, async (req, res) => {
    const { userId, blogPostId, commentId } = req.params;
    const loggedInUser = req.user;

    // -> we only want the owner of the comment to be able to delete it
    if (loggedInUser.userId === userId) {
      return res
        .status(401)
        .json({ message: "Cannot delete comment! The owner has to log in!" });
    }

    // -> sterge documentul comentariului
    await req.commentDocRef.delete();

    // -> sterge comentariul din array-ul comentariilor din documentul blogPost-ului
    let blogPostComments = req.blogPostDocData.comments;

    blogPostComments = blogPostComments.filter(
      (blogPostComment) => blogPostComment.commentId !== commentId
    );

    await req.blogPostDocRef.update({ comments: blogPostComments });

    // -> sterge comentariul din array-ul blogPost-urilor din documentul utilizatorului
    const blogPostIndex = req.userDocData.blogPosts.findIndex(
      (blogPost) => blogPost.blogPostId === blogPostId
    );

    if (blogPostIndex === -1) {
      return res.status(404).json({ message: "Blog post not found!" });
    }

    // -> cream un array de blogPost-uri
    const updatedBlogPostsArray = [...req.userDocData.blogPosts];

    // -> cream un array de comentarii folosind-ul pe ce de blogPost-uri
    const updatedCommentsArray =
      updatedBlogPostsArray[blogPostIndex].comments || [];

    // -> filtram comentariul al carui id l-am primit in URL
    const updatedComments = updatedCommentsArray.filter(
      (comment) => comment.commentId !== commentId
    );

    // -> actualizam array-ul blogPost-urilor cu noul array de comentarii
    updatedBlogPostsArray[blogPostIndex].comments = updatedComments;

    // -> actualizam documentul utilizatorului
    await req.userDocRef.update({ blogPosts: updatedBlogPostsArray });

    return res.status(200).json({
      message: `The comment with id {${commentId}} has been deleted!`,
    });
  });

module.exports = router;
