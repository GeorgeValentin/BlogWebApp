const router = require("express").Router();
const { db } = require("../firebaseConfig");
const generateData = require("../utils/dataGen");
const utils = require("../utils/utils");
const checkUser = require("../middleware/checkUser");
const checkBlogPost = require("../middleware/checkBlogPost");
const auth = require("../middleware/auth");

// GET /allBlogPosts
router.route("/allBlogPosts").get(async (req, res) => {
  try {
    // -> extragem colectiile de obiecte din firestore
    const blogPostsCollection = db.collection("blogPosts");
    const usersCollection = db.collection("users");

    // -> extragem documentele din colectia "blogPosts"
    let blogPostsDocs = await blogPostsCollection.get();

    let response = [];

    // -> mapam documentele din colectia blogPosts
    // = luam fiecare document din colectie, il modificam, si la final cream un nou array cu rezultatele obtinute
    const blogPostsArray = blogPostsDocs.docs.map(async (blogPostDoc) => {
      // -> datele unui obiect din colectia de documente
      const blogPostDocData = blogPostDoc.data();

      const userDocRef = usersCollection.doc(blogPostDocData.authorId);
      const userDoc = await userDocRef.get();
      const userDocData = userDoc.data();

      // -> cream un nou obiect: blogPostCopy, in care adaugam toate proprietatile obiectului blogPostDocData
      // -> shallow copy = daca printre proprietatile copiate se numara array/object, orice modificare adusa acelor
      // proprietati va fi reflectata in amandoua obiecte
      const { ...blogPostCopy } = blogPostDocData;

      // -> cream un obiect folosind proprietatile lui blogPostCopy = ...blogPostCopy
      // -> acestui obiect ii adaugam proprietatea authorName
      const blogPostWithAuthorName = {
        ...blogPostCopy,
        authorName: userDocData.username,
      };

      // -> returnam obiectul
      return blogPostWithAuthorName;
    });

    // -> asteapta ca toate documentele sa fie parcurse si noul array sa fie creat
    response = await Promise.all(blogPostsArray);

    // -> returnam 200 OK si array-ul cu datele blogPostului impreuna cu authorName-ul
    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// GET /users/:userId/blogPostsOfOthers
// -> get the blog posts of other users
// -> needed so that we can comment on other user's posts
router
  .route("/users/:userId/blogPostsOfOthers")
  // -> checkUser = middleware care verifica userId-ul
  .get(checkUser, async (req, res) => {
    try {
      const userId = req.params.userId;

      const blogPostsCollection = db.collection("blogPosts");
      const usersCollection = db.collection("users");

      let blogPostsDocs = await blogPostsCollection.get();
      let response = [];

      const blogPostsArray = blogPostsDocs.docs.map(async (blogPostDoc) => {
        const blogPostDocData = blogPostDoc.data();

        // -> vrem sa modificam doar blogPost-urile care nu apartin utilizatorului utilizatorului al caruit ID e primit in ruta, cel logat
        // -> vrem sa adaugam authorName-ul si sa returnam obiectul
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

      // -> asteapta incheierea executiei
      response = await Promise.all(blogPostsArray);

      // -> filtreaza valorile care sunt null/undefined
      const filteredResponse = response.filter(
        (elem) => elem !== null && elem !== undefined
      );

      return res.status(200).json(filteredResponse);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  });

// GET /users/:userId/blogPosts
// -> all blog posts of logged in user
router
  .route("/users/:userId/blogPosts")
  .get(checkUser, async (req, res) => {
    try {
      const userId = req.params.userId;
      const blogPostsCollection = db.collection("blogPosts");
      let response = [];
      let blogPostsArrCopy = [];

      // -> daca utilizatorul autentificat nu are niciun document in colectia de blogPosts, genereaza-le random folosind chance.js
      // => 3 documentel generate
      if (req.userDocData.blogPosts.length === 0) {
        // -> genereaza un array de blogPosts
        const blogPostsArray = Array.from(
          { length: 3 },
          generateData.generateBlogPost
        );

        // -> genereaza un array de categories
        const categoriesArray = Array.from(
          { length: 3 },
          generateData.generateCategory
        );

        // -> parcurge array-ul de blogPosts
        for (let blogPost of blogPostsArray) {
          // -> adauga fiecarui blogPost id-ul autorului (userul logat)
          blogPost.authorId = userId;

          // -> adauga o categorie aleasa aleator din array
          const randomCategoryValue =
            categoriesArray[utils.randomizeArray(3)].category;
          blogPost.category = randomCategoryValue;

          // -> adauga blogPost-ul in colectia din firestore
          const addedBlogPost = await blogPostsCollection.add(blogPost);

          // -> seteaza id-ul blogPost-ului si colectia de comentarii in obiectul de blogPost din firestore
          blogPost.blogPostId = addedBlogPost.id;
          blogPost.comments = [];

          // -> actualizeaza obiectul in firestore
          await blogPostsCollection.doc(addedBlogPost.id).update(blogPost);
        }

        // -> creeaza o copie a array-ului de blogPost in care fiecare element sa includa si autorName-ul
        for (let blogPost of blogPostsArray) {
          const { ...blogPostCopy } = blogPost;

          const blogPostWithAuthorName = {
            ...blogPostCopy,
            authorName: req.userDocData.username,
          };

          blogPostsArrCopy.push(blogPostWithAuthorName);
        }

        // -> stocheaza array-ul in colectia de users, in documentul utilizatorului logat
        req.userDocRef.update({ blogPosts: blogPostsArray });

        // -> returneaza array-ul care contine authorName-ul
        response = blogPostsArrCopy;
      } else {
        // -> Extrage si filtreaza blogPost-urile pentru utilizatorul logat
        const blogPostsQuerySnapshot = await blogPostsCollection
          .where("authorId", "==", userId)
          .get();

        // -> parcurge documentele de tip blogPost, si adauga in response copii a fiecarui document in care acesta sa contina si authorName-ul
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
  // -> POST /users/:userId/blogPosts
  // -> add a blog post (DONE)
  // -> folosim middleware-uri
  // -> auth = se asigura ca suntem logati inainte sa executam codul (peste tot pe unde l-am folosit e aceasta functionalitate)
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

      // -> ne asiguram ca id-ul din ruta coincide cu cel al utilizatorului logat
      // -> facem asta pentru ca nu vrem sa adaugam blogPost-uri altui utilizator
      if (loggedInUser.userId !== userId) {
        return res.status(401).json({
          message:
            "Cannot add blog post! You are trying to add a blog post to someone else's list!",
        });
      }

      const blogPostsCollection = db.collection("blogPosts");

      // -> adauga blogPost-ul
      blogPostToAdd.authorId = userId;
      blogPostToAdd.comments = [];
      blogPostToAdd.lastModifiedAt = new Date().toLocaleDateString();

      const addedBlogPost = await blogPostsCollection.add(blogPostToAdd);
      blogPostToAdd.blogPostId = addedBlogPost.id;
      await blogPostsCollection.doc(addedBlogPost.id).update(blogPostToAdd);

      req.userDocData.blogPosts.push(blogPostToAdd);

      // -> modifica colectia de users, documentul userului logat, cu noua colectie de blogPosts, continand noul blogPost adaugat
      await req.userDocRef.update({ blogPosts: req.userDocData.blogPosts });

      return res.status(200).json(blogPostToAdd);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  });

router
  // GET /users/:userId/blogPosts/:blogPostId
  // -> get blog post by id
  .route("/users/:userId/blogPosts/:blogPostId")
  .get(checkUser, checkBlogPost, async (req, res) => {
    // -> extragem informatiile blogPost-ului folosind middleware-ul checkBlogPost si cream o copie
    const { ...blogPostCopy } = req.blogPostDocData;

    // -> adaugam authorName-ul pe noul blogPost folosind middleware-ul checkUser
    const blogPostWithAuthorName = {
      ...blogPostCopy,
      authorName: req.userDocData.username,
    };

    return res.status(200).json(blogPostWithAuthorName);
  })
  // PUT /users/:userId/blogPosts/:blogPostId
  // -> update blog post
  .put(auth, checkUser, checkBlogPost, async (req, res) => {
    const { blogPostId, userId } = req.params;
    const loggedInUser = req.user;

    if (loggedInUser.userId !== userId) {
      return res.status(401).json({
        message: "Cannot update blog post! You are not the owner of the post!",
      });
    }

    const blogPostToUpdate = req.body;

    // -> verificam ca obiectul primit din request sa contina toate informatiile necesare
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

    // -> modificam documentul blogPost cu informatiile primite de pe request
    req.blogPostDocData.title = blogPostToUpdate.title;
    req.blogPostDocData.content = blogPostToUpdate.content;
    req.blogPostDocData.category = blogPostToUpdate.category;
    req.blogPostDocData.lastModifiedAt = new Date().toLocaleDateString();

    await req.blogPostDocRef.update(req.blogPostDocData);

    // -> modificam documentul utilizatorului logat, colectia de blogPosts, blogPost-ul avand id-ul primit in URL
    // cu informatiile primite de pe request
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
  // DELETE /users/:userId/blogPosts/:blogPostId
  // -> delete a post with a specific user id
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

    // -> verificam ca utilizatorul logat sa fie detinatorul blogPost-ului
    if (loggedInUser.userId === userId) {
      // -> blogPost-ul are comentarii
      if (req.blogPostDocData.comments.length !== 0) {
        // le stergem pentru ca nu are sens sa le pastram daca blogPost-ul nu mai exista
        commentsDocs.forEach(async (commentDoc) => {
          const commentDocData = commentDoc.data();

          // -> sterge un comentariu
          await commentsCollection.doc(commentDocData.commentId).delete();

          // -> actualizeaza colectia blogPost-urilor
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

    // -> sterge blogPost-ul din documentul utilizatorului logat
    let userBlogPosts = req.userDocData.blogPosts;

    userBlogPosts = userBlogPosts.filter(
      (userBlogPost) => userBlogPost.blogPostId !== blogPostId
    );

    // -> actualizeaza documentul utilizatorului logat sa nu includa blogPostul specificat
    await req.userDocRef.update({ blogPosts: userBlogPosts });

    // -> sterge blogPost-ul specificat din colectia de blogPosts
    await req.blogPostDocRef.delete();

    return res.status(200).json({
      message: `The blog post with id {${blogPostId}} deleted succesfully together with all its comments!`,
    });
  });

module.exports = router;
