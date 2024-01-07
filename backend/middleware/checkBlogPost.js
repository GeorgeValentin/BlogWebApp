const { db } = require("../firebaseConfig");

// -> Middleware = functie care verifica blogPostId-ul din lista parametrilor pasati in calea (URL-ul) care il cheama
const checkBlogPost = async (req, res, next) => {
  // -> object destructuring = extrage blogPostId de pe obiectul params al requestului
  const { blogPostId } = req.params;

  // -> verifica ca blogPostId sa fie de tip string
  if (!blogPostId || typeof blogPostId !== "string") {
    return res.status(400).json({
      message: "Invalid blogPostId provided",
    });
  }

  // -> extragere referinta catre documentul care are id-ul egal cu cel pasat in URL
  const blogPostDocRef = db.collection("blogPosts").doc(blogPostId);

  try {
    // -> extragere documentul care are id-ul egal cu cel pasat in URL
    const blogPostDoc = await blogPostDocRef.get();

    // -> verificare daca documentul exista
    if (!blogPostDoc.exists) {
      return res.status(404).json({
        message: `The blog post with id {${blogPostId}} does not exist!`,
      });
    }

    // -> adaugarea pe obiectul de request a proprietatilor relevante
    req.blogPostsCollection = db.collection("blogPosts");

    // -> aici stocam toate documentele din colectia de blogPosts din firestore
    req.blogPostsDocs = await req.blogPostsCollection.get();
    req.blogPostDocRef = blogPostDocRef;
    req.blogPostDoc = blogPostDoc;

    // -> aici stocam datele documentului cu id-ul pasat in URL
    req.blogPostDocData = blogPostDoc.data();

    // -> mergi la urmatorul punct de executie
    next();
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = checkBlogPost;
