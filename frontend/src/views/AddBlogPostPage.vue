<template>
  <article class="overflow-hidden">
    <header>
      <h2 class="add-blog-post-page-title mt-5 mb-4 fw-bold fs-2">
        Add a new Blog Post
      </h2>
    </header>

    <div class="card">
      <div class="card-body">
        <div
          class="form-field-group importantPublications d-flex justify-content-between m-auto p-2"
        >
          <span class="fw-bold text-light me-1 fs-6">Title:</span>
          <input
            type="text"
            class="input-container border border-1 border-secondary rounded"
            v-model="blogPost.title"
          />
        </div>

        <div
          class="form-field-group importantPublications d-flex justify-content-between m-auto p-2"
        >
          <span class="fw-bold text-light me-1 fs-6">Category:</span>

          <input
            type="text"
            class="input-container border border-1 border-secondary rounded"
            v-model="blogPost.category"
          />
        </div>

        <div
          class="form-field-group name d-flex justify-content-between align-items-center m-auto p-2"
        >
          <span class="fw-bold text-light me-1 fs-6">Content:</span>
          <textarea
            type="text"
            class="input-container content-box border border-1 border-secondary rounded"
            v-model="blogPost.content"
          ></textarea>
        </div>

        <div
          class="d-flex justify-content-center align-items-center flex-column gap-2 my-3"
        >
          <button
            type="button"
            class="btn btn-dark text-light border border-dark border-3 fw-bold w-25"
            @click="createBlogPost(getLoggedInUserData.userId, blogPost)"
          >
            Add Post
          </button>

          <button
            type="button"
            class="btn btn-outline-light border border-light border-3 fw-bold w-25"
            @click="goBackHome"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "AddBlogPostPage",
  data() {
    return {
      blogPost: {},
      message: "",
    };
  },
  computed: {
    ...mapGetters("auth", ["getLoggedInStatus", "getLoggedInUserData"]),
    ...mapGetters("blogPostsModule", ["getBlogPostAddStatus"]),
  },
  methods: {
    ...mapActions("blogPostsModule", ["addBlogPost"]),
    createBlogPost: async function (userId, blogPostData) {
      const blogPostToAdd = {
        title: blogPostData.title,
        category: blogPostData.category,
        content: blogPostData.content,
      };

      await this.addBlogPost({ userId, blogPostToAdd });

      if (this.getBlogPostAddStatus === true) {
        this.$router.push("/");
      }
    },
  },
};
</script>

<style scoped>
.add-blog-post-page-title {
  margin-top: 3rem;
  margin-bottom: 2rem;
}
.card {
  width: 35rem;
  height: 31rem;
  margin: auto;
  background-color: #575fcf;
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
</style>
