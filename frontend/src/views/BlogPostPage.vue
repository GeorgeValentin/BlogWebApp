<template>
  <article
    class="blog-post-page d-flex justify-content-center align-items-center"
  >
    <div class="card">
      <div class="card-body">
        <header class="d-flex justify-content-center align-items-center gap-3">
          <h5 class="my-4 fw-bold fs-2">
            Blog post of author "{{ username }}"
          </h5>
          <img
            class="blog-post-img"
            src="../assets/blog-post.png"
            alt="blog-post"
          />
        </header>

        <div
          class="form-field-group importantPublications d-flex justify-content-between m-auto p-2"
        >
          <span class="fw-bold text-dark me-1 fs-6">Title:</span>
          <input
            type="text"
            class="input-container border border-1 border-secondary rounded"
            v-model="getBlogPost.title"
          />
        </div>

        <div
          class="form-field-group importantPublications d-flex justify-content-between m-auto p-2"
          v-if="getBlogPost.category !== undefined"
        >
          <span class="fw-bold text-dark me-1 fs-6">Category:</span>

          <input
            type="text"
            class="input-container border border-1 border-secondary rounded"
            v-model="getBlogPost.category"
          />
        </div>

        <div
          class="form-field-group name d-flex justify-content-between align-items-center m-auto p-2"
        >
          <span class="fw-bold text-dark me-1 fs-6">Content:</span>
          <textarea
            type="text"
            class="input-container content-box border border-1 border-secondary rounded"
            v-model="getBlogPost.content"
          ></textarea>
        </div>

        <div
          class="d-flex justify-content-center align-items-center flex-column gap-2 my-3"
        >
          <button
            type="button"
            class="btn btn-success fw-bold w-25"
            @click="
              editBlogPost(getLoggedInUserData.userId, blogPostId, getBlogPost)
            "
          >
            Edit Post
          </button>

          <button
            type="button"
            class="btn btn-dark fw-bold w-25"
            @click="goBackHome"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>

    <div class="form-group update-status-msg-container">
      <div v-if="message" class="alert alert-success" role="alert">
        {{ message }}
      </div>
    </div>
  </article>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "BlogPostPage",
  data() {
    return {
      blogPostId: "",
      blogPost: {},
      message: "",
      username: "",
    };
  },
  computed: {
    ...mapGetters("auth", ["getLoggedInStatus", "getLoggedInUserData"]),
    ...mapGetters("blogPostsModule", [
      "getBlogPost",
      "getBlogPostUpdateStatus",
    ]),
  },
  created() {
    this.blogPostId = this.$route.params.blogPostId;

    if (
      this.getLoggedInStatus !== false &&
      this.getLoggedInUserData !== undefined
    ) {
      this.getBlogPostById(this.getLoggedInUserData.userId, this.blogPostId);
      this.username = this.getLoggedInUserData.username;
    }
  },
  methods: {
    ...mapActions("blogPostsModule", [
      "getBlogPostByIdOfLoggedInUser",
      "updateBlogPost",
    ]),

    // -> when you have more than one argument to pass to vuex module pass it as object or an array
    // since vuex "dispatching" can only take two args: 1. the name of the action and 2. the payload
    getBlogPostById: async function (userId, blogPostId) {
      await this.getBlogPostByIdOfLoggedInUser({
        userId,
        blogPostId,
      });
    },
    editBlogPost: async function (userId, blogPostId, blogPost) {
      const updatedBlogPost = {
        title: blogPost.title,
        category: blogPost.category,
        content: blogPost.content,
      };

      await this.updateBlogPost({
        userId: userId,
        blogPostId: blogPostId,
        blogPostToUpdate: updatedBlogPost,
      });

      if (this.getBlogPostUpdateStatus === true) {
        this.message = "Blog post updated successfully!";
      }
    },
    goBackHome: function () {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.card {
  width: 35rem;
  height: 35rem;
  margin: auto;
  background-color: #f6e58d;
}
.blog-post-page {
  height: 70vh;
}
.form-field-group {
  width: 95%;
}
.content-box {
  height: 15rem;
}
.input-container {
  width: 75%;
}
.blog-post-img {
  width: 3rem;
}
.update-status-msg-container {
  position: absolute;
  bottom: 29%;
  width: 26.5%;
}
.update-status-msg-container > div {
  font-weight: bold;
}
</style>
