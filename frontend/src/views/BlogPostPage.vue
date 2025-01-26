<template>
  <article
    class="page-element d-flex justify-content-center align-items-center blog-post-page">
    <div class="card">
      <div class="card-body">
        <header
          class="title-container d-flex justify-content-center align-items-center gap-3">
          <h5 class="my-4 fw-bold fs-2">
            Blog post of author "{{ username }}"
          </h5>

          <img
            class="blog-post-img"
            src="../assets/blog-post.png"
            alt="blog-post" />
        </header>

        <div
          class="form-field-group importantPublications d-flex justify-content-between m-auto p-2">
          <span class="fw-bold text-dark me-1 fs-6">Title:</span>

          <input
            type="text"
            class="input-container border border-1 border-secondary rounded"
            v-model="getBlogPost.title"
            v-if="blogPostOfLoggedInUserStatus === true" />

          <div v-else class="text-field-highlight">
            {{ getBlogPost.title }}
          </div>
        </div>

        <div
          class="form-field-group importantPublications d-flex justify-content-between m-auto p-2"
          v-if="getBlogPost.category !== undefined">
          <span class="fw-bold text-dark me-1 fs-6">Category:</span>

          <input
            type="text"
            class="input-container border border-1 border-secondary rounded"
            v-model="getBlogPost.category"
            v-if="blogPostOfLoggedInUserStatus === true" />

          <div v-else class="text-field-highlight">
            {{ getBlogPost.category }}
          </div>
        </div>

        <div
          class="form-field-group name d-flex justify-content-between align-items-center m-auto p-2">
          <span class="fw-bold text-dark me-1 fs-6">Content:</span>

          <textarea
            type="text"
            class="input-container content-box border border-1 border-secondary rounded"
            v-model="getBlogPost.content"
            v-if="blogPostOfLoggedInUserStatus === true"></textarea>

          <div
            v-else
            id="text-area-highlight-text"
            class="text-field-highlight content-container">
            <div>
              {{ getBlogPost.content }}
            </div>
          </div>
        </div>

        <div v-if="blogPostOfLoggedInUserStatus === false">
          <comments-list
            :eventEmitStatus="eventEmitStatusOn"
            :commentsList="getComments"
            :noCommentsMessage="emptyCommentMsg"
            @addComment="addComment"
            @deleteComment="deleteComment"
            @editComment="editComment" />
        </div>

        <div
          class="d-flex justify-content-center align-items-center flex-column gap-2 my-3"
          v-else>
          <div
            class="blog-post-page-btns-container d-flex justify-content-center align-items-center flex-row gap-2">
            <button
              type="button"
              class="btn btn-success fw-bold"
              @click="
                editBlogPost(
                  getLoggedInUserData.userId,
                  blogPostId,
                  getBlogPost
                )
              ">
              Edit Post
            </button>

            <button
              type="button"
              class="btn btn-dark fw-bold"
              @click="goBackHome">
              Go Back
            </button>
          </div>

          <comments-list
            :eventEmitStatus="false"
            :commentsList="getCommentsOfOtherUsers"
            :noCommentsMessage="emptyCommentMsg" />
        </div>
      </div>

      <div v-if="alertStatus === 'error'" class="alert-container mt-4">
        <alert-message :msg="message" alertType="alert-danger" />
      </div>

      <div v-if="alertStatus === 'success'" class="alert-container mt-4">
        <alert-message :msg="message" alertType="alert-success" />
      </div>

      <div v-if="alertStatus === 'delete'" class="alert-container mt-4">
        <alert-message :msg="message" alertType="alert-dark" />
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
      alertStatus: "",
      loadingStatus: true,
      blogPostOfLoggedInUserStatus: false,
      eventEmitStatusOn: true,
      emptyCommentMsg: "",
    };
  },
  components: { AlertMessage, CommentsList },
  computed: {
    ...mapGetters("auth", ["getLoggedInStatus", "getLoggedInUserData"]),
    ...mapGetters("blogPostsModule", [
      "getBlogPost",
      "getBlogPostUpdateStatus",
    ]),
    ...mapGetters("commentsModule", [
      "getComments",
      "getAddCommentStatus",
      "getDeletedCommentStatus",
      "getUpdatedCommentStatus",
      "getCommentsOfOtherUsers",
    ]),
  },
  created() {
    console.log(this.getCommentsOfOtherUsers);
    this.blogPostId = this.$route.params.blogPostId;
    this.authorId = this.$route.params.authorId;

    if (this.getLoggedInStatus === true && this.getLoggedInUserData !== null) {
      // -> this means I am navigating to the logged in user posts(HOME) - Otherwise it's the COMMUNITY
      if (this.authorId === this.getLoggedInUserData.userId) {
        this.blogPostOfLoggedInUserStatus = true;
        this.authorId = this.getLoggedInUserData.userId;

        this.getCommentsOfOthers(this.blogPostId);
        this.emptyCommentMsg =
          "There have not been any comments added yet! Spread the word about your great ideas and topics!";
      } else {
        this.getEntireListOfComments(this.blogPostId);
        this.emptyCommentMsg =
          "There have not been any comments added yet! Start expressing your thoughts now!";
      }

      this.getBlogPostByItsId(this.authorId, this.blogPostId);
    } else {
      this.handleLogout();
    }
  },
  methods: {
    ...mapActions("blogPostsModule", ["getBlogPostById", "updateBlogPost"]),
    ...mapActions("commentsModule", [
      "getCommentsOfBlogPostFromOthers",
      "addCommentToBlogPost",
      "getCommentsFromAllUsersOfBlogPost",
      "deleteCommentOfBlogPost",
      "updateCommentOfBlogPost",
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
        this.alertStatus = "error";
        this.loadingStatus = true;
        this.setAutoHideAlert();
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
          this.alertStatus = "success";
          this.setAutoHideAlert();
        }
      } catch (error) {
        if (error.response.status === 401 || error.response.status === 403) {
          this.handleLogout();
        }
        this.message = filterErrorMessages(error.response.status);
        this.alertStatus = "error";
        this.setAutoHideAlert();
      }
    },
    getEntireListOfComments: async function (blogPostId) {
      try {
        await this.getCommentsFromAllUsersOfBlogPost({
          blogPostId,
        });
      } catch (error) {
        if (error.response.status === 401 || error.response.status === 403) {
          this.handleLogout();
        }
        this.message = filterErrorMessages(error.response.status);
        this.alertStatus = "error";
        this.setAutoHideAlert();
      }
    },
    getCommentsOfOthers: async function (blogPostId) {
      try {
        await this.getCommentsOfBlogPostFromOthers({
          blogPostId,
        });
      } catch (error) {
        if (error.response.status === 401 || error.response.status === 403) {
          this.handleLogout();
        }
        this.message = filterErrorMessages(error.response.status);
        this.alertStatus = "error";
        this.setAutoHideAlert();
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
          this.alertStatus = "success";
          this.setAutoHideAlert();
        }
      } catch (error) {
        if (error.response.status === 401 || error.response.status === 403) {
          this.handleLogout();
        }
        this.message = filterErrorMessages(error.response.status);
        this.alertStatus = "error";
        this.setAutoHideAlert();
      }
    },
    editComment: async function (payload) {
      const { userId, blogPostId, commentId, commentData } = payload;

      const commentToUpdate = {
        content: commentData,
      };

      try {
        await this.updateCommentOfBlogPost({
          userId,
          blogPostId,
          commentId,
          commentToUpdate,
        });

        if (this.getUpdatedCommentStatus === true) {
          this.getEntireListOfComments(this.blogPostId);

          this.message = "Comment updated successfully!";
          this.alertStatus = "success";
          this.setAutoHideAlert();
        }
      } catch (error) {
        if (error.response.status === 401 || error.response.status === 403) {
          this.handleLogout();
        }
        this.message = filterErrorMessages(error.response.status);
        this.alertStatus = "error";
        this.setAutoHideAlert();
      }
    },
    deleteComment: async function (userId, blogPostId, commentId) {
      try {
        await this.deleteCommentOfBlogPost({ userId, blogPostId, commentId });

        console.log(this.getDeletedCommentStatus);
        if (this.getDeletedCommentStatus === true) {
          this.message = "Comment deleted successfully!";
          this.alertStatus = "delete";
          this.setAutoHideAlert();
        }
      } catch (error) {
        if (error.response.status === 401 || error.response.status === 403) {
          this.handleLogout();
        }
        this.message = filterErrorMessages(error.response.status);
        this.alertStatus = "error";
        this.setAutoHideAlert();
      }
    },
    setAutoHideAlert: function () {
      setTimeout(() => {
        this.message = "";
        this.alertStatus = "";
      }, 3500);
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
  height: 79%;
  margin: 3rem auto;
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
.alert-container {
  position: absolute;
  top: 54rem;
  width: 100%;
}
.content-container {
  max-height: 8rem;
  min-height: 8rem;
  overflow: auto;
}

@media (max-width: 500px) {
  .blog-post-page {
    margin-top: 8rem;
  }
  .card {
    min-height: 50rem !important;
    max-height: 55rem !important;

    width: 24rem !important;
    margin: 0rem auto 5rem !important;
  }

  .title-container {
    margin-bottom: 1rem !important;
  }

  .title-container > h5 {
    margin: 0 !important;
    font-size: 1.2rem !important;
  }

  .title-container > img {
    width: 2rem;
  }

  .form-field-group {
    flex-direction: column;
    width: 100%;
  }
  .form-field-group > span {
    width: 100%;
  }

  .form-field-group > div {
    width: 100%;
    padding: 0.25rem;
  }

  .alert-container {
    top: 49rem;
  }

  .input-container {
    width: 100%;
  }

  textarea {
    height: 8rem !important;
  }

  .blog-post-page-btns-container {
    flex-direction: row !important;
    width: 100%;
  }

  .blog-post-page-btns-container > button {
    width: 40% !important;
    font-weight: bold !important;
  }
}
</style>
