<template>
  <article
    class="page-element d-flex justify-content-center align-items-center"
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
            v-if="blogPostOfLoggedInUserStatus === true"
          />

          <div v-else class="text-field-highlight">
            {{ getBlogPost.title }}
          </div>
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
            v-if="blogPostOfLoggedInUserStatus === true"
          />

          <div v-else class="text-field-highlight">
            {{ getBlogPost.category }}
          </div>
        </div>

        <div
          class="form-field-group name d-flex justify-content-between align-items-center m-auto p-2"
        >
          <span class="fw-bold text-dark me-1 fs-6">Content:</span>

          <textarea
            type="text"
            class="input-container content-box border border-1 border-secondary rounded"
            v-model="getBlogPost.content"
            v-if="blogPostOfLoggedInUserStatus === true"
          ></textarea>

          <div
            v-else
            id="text-area-highlight-text"
            class="text-field-highlight"
          >
            {{ getBlogPost.content }}
          </div>
        </div>

        <div v-if="blogPostOfLoggedInUserStatus === false">
          <comments-list :commentsList="getComments" @addComment="addComment" />
        </div>

        <div
          class="d-flex justify-content-center align-items-center flex-column gap-2 my-3"
          v-else
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

      <div v-if="errStatus === 'error'" class="mt-4">
        <alert-message :msg="message" alertType="alert-danger" />
      </div>

      <div v-if="errStatus === 'success'" class="mt-4">
        <alert-message :msg="message" alertType="alert-success" />
      </div>
    </div>
  </article>
</template>

<script>
import { filterErrorMessages } from "@/utils/utility";
import { mapActions, mapGetters } from "vuex";
import AlertMessage from "@/components/AlertMessage";
import CommentsList from "@/components/CommentsList";

export default {
  name: "BlogPostPage",
  data() {
    return {
      blogPostId: "",
      authorId: "",
      blogPost: {},
      message: "",
      errorMessage: "",
      username: "",
      errStatus: "",
      loadingStatus: true,
      blogPostOfLoggedInUserStatus: false,
    };
  },
  components: { AlertMessage, CommentsList },
  computed: {
    ...mapGetters("auth", ["getLoggedInStatus", "getLoggedInUserData"]),
    ...mapGetters("blogPostsModule", [
      "getBlogPost",
      "getBlogPostUpdateStatus",
    ]),
    ...mapGetters("commentsModule", ["getComments", "getAddCommentStatus"]),
  },
  created() {
    this.blogPostId = this.$route.params.blogPostId;
    this.authorId = this.$route.params.authorId;

    if (this.getLoggedInStatus === true && this.getLoggedInUserData !== null) {
      if (this.authorId === this.getLoggedInUserData.userId) {
        this.blogPostOfLoggedInUserStatus = true;
        this.authorId = this.getLoggedInUserData.userId;
      }

      this.getEntireListOfComments(
        this.getLoggedInUserData.userId,
        this.blogPostId
      );
    }

    this.getBlogPostByItsId(this.authorId, this.blogPostId);
  },
  methods: {
    ...mapActions("blogPostsModule", ["getBlogPostById", "updateBlogPost"]),
    ...mapActions("commentsModule", [
      "getCommentsOfBlogPost",
      "addCommentToBlogPost",
    ]),
    ...mapActions("auth", ["logout"]),
    handleLogout: function () {
      this.logout();
      this.$router.push("/login");
    },
    // -> when you have more than one argument to pass to vuex module pass it as object or an array
    // since vuex "dispatching" can only take two args: 1. the name of the action and 2. the payload
    getBlogPostByItsId: async function (userId, blogPostId) {
      try {
        await this.getBlogPostById({
          userId,
          blogPostId,
        });

        this.username = this.getBlogPost.authorName;

        this.loadingStatus = false;
      } catch (error) {
        if (error.response.status === 401 || error.response.status === 403) {
          this.handleLogout();
        }
        this.message = filterErrorMessages(error.response.status);
        this.errStatus = "error";
        this.loadingStatus = true;
      } finally {
        this.loadingStatus = false;
      }
    },
    editBlogPost: async function (userId, blogPostId, blogPost) {
      const updatedBlogPost = {
        title: blogPost.title,
        category: blogPost.category,
        content: blogPost.content,
      };

      try {
        await this.updateBlogPost({
          userId: userId,
          blogPostId: blogPostId,
          blogPostToUpdate: updatedBlogPost,
        });

        if (this.getBlogPostUpdateStatus === true) {
          this.message = "Blog post updated successfully!";
          this.errStatus = "success";
        }
      } catch (error) {
        this.message = filterErrorMessages(error.response.status);
        this.errStatus = "error";
      }
    },
    getEntireListOfComments: async function (userId, blogPostId) {
      try {
        await this.getCommentsOfBlogPost({
          userId,
          blogPostId,
        });
      } catch (error) {
        this.message = filterErrorMessages(error.response.status);
        this.errStatus = "error";
      }
    },
    addComment: async function (payload) {
      const { userId, blogPostId, commentData } = payload;

      const comment = {
        content: commentData,
      };

      try {
        await this.addCommentToBlogPost({
          loggedInUserId: this.getLoggedInUserData.userId,
          userId: userId,
          blogPostId: blogPostId,
          commentToAdd: comment,
        });

        if (this.getAddCommentStatus === true) {
          this.message = "Comment added successfully!";
          this.errStatus = "success";
        }
      } catch (error) {
        console.log(error);
        this.message = filterErrorMessages(error.response.status);
        this.errStatus = "error";
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
  height: 78%;
  margin: auto;
  background-color: #f6e58d;
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
.text-field-highlight {
  border: 2px solid black;
  padding: 0.5rem;
  width: 75%;
  border-radius: 0.25rem;
}

#text-area-highlight-text {
  padding: 0.1rem;
  text-align: justify;
}
</style>
