<template>
  <article class="mt-3">
    <span class="fw-bold fs-5"> Comments Section!</span>

    <div class="comments-section mb-3">
      <div
        v-if="commentsList.length === 0"
        class="no-comments-section d-flex justify-content-center align-items-center flex-column gap-1"
      >
        <img
          class="no-comments-img"
          src="../assets/noComments.png"
          alt="no-comments-img"
        /><span class="w-50 my-0 m-auto fst-italic fs-6 fw-bold"
          >There have not been any comments added! Start expressing your
          thoughts now!</span
        >
      </div>
      <div
        v-else
        class="p-2"
        v-for="comment in commentsList"
        :key="comment.commentId"
      >
        <section
          class="comment-entry fs-6 mb-2 w-100 m-auto d-flex justify-content-center gap-2 align-items-center"
        >
          <div class="comment-container border border-2 border-dark w-75">
            <div class="text-center fw-bold fst-italic fs-5">
              "{{ comment.content }}"
            </div>
            <div
              class="comment-details-container d-flex justify-content-start align-items-end"
            >
              <div
                class="d-flex justify-content-center align-items-center gap-2"
              >
                <font-awesome-icon icon="user" />
                <span>{{ comment.authorName }}</span>
              </div>

              <div
                class="d-flex justify-content-center align-items-center gap-2"
              >
                <font-awesome-icon icon="calendar-day" />
                <span>{{ comment.lastModifiedAt }}</span>
              </div>
            </div>

            <!-- allow the deletion only for the comments of the logged in user -->
            <div v-if="comment.authorId === getLoggedInUserData.userId">
              <button
                class="delete-comm-btn d-flex justify-content-center align-items-center gap-2 btn btn-danger border border-2 border-danger"
                @click="
                  $emit('deleteComment', userId, blogPostId, comment.commentId)
                "
              >
                <font-awesome-icon icon="fa-trash" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>

    <div class="add-comment-container mt-2">
      <div
        class="add-comment-element d-flex justify-content-center align-items-center gap-2 flex-column"
      >
        <div class="form-floating">
          <textarea
            class="form-control content-elem"
            placeholder="Leave a comment here"
            id="floatingTextarea2"
            style="height: 120px"
            :maxlength="commentCharacterLimit"
            v-model="commentData"
          ></textarea>
          <label for="floatingTextarea2">Comments</label>
        </div>

        <div
          class="add-comm-action-container d-flex justify-content-between align-items-center"
        >
          <div>{{ remainingCharacters }} characters left</div>

          <button
            v-if="getLoggedInStatus === true && getLoggedInUserData !== null"
            class="d-flex justify-content-center align-items-center flex-row gap-2 btn btn-primary border border-2 border-primary"
            @click="addComment"
          >
            <font-awesome-icon icon="fa-plus" />
            <span class="fw-bold">Add</span>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script>
import { mapGetters } from "vuex";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

export default {
  name: "CommentsList",
  props: ["commentsList"],
  components: { FontAwesomeIcon },
  data() {
    return {
      commentData: "",
      commentCharacterLimit: 105,
      blogPostId: "",
      userId: "",
    };
  },
  created() {
    this.blogPostId = this.$route.params.blogPostId;
    this.userId = this.$route.params.authorId;
  },
  computed: {
    ...mapGetters("auth", ["getLoggedInStatus", "getLoggedInUserData"]),
    remainingCharacters() {
      return this.commentCharacterLimit - this.commentData.length;
    },
  },
  methods: {
    addComment: async function () {
      const payload = {
        userId: this.userId,
        blogPostId: this.blogPostId,
        commentData: this.commentData,
      };

      this.$emit("addComment", payload);

      this.commentData = "";
    },
  },
};
</script>

<style scoped>
.comments-section {
  min-height: 15rem;
  max-height: 15rem;
  overflow: auto;
}
.comment-entry {
  border-radius: 0.25rem;
  padding-top: 0.5rem;
}
.comment-details-container {
  padding: 1.25rem 1rem 0.5rem;
  gap: 4rem;
}
.add-comment-element {
  width: 73%;
  margin: auto;
}
.content-elem {
  resize: none !important;
  overflow-y: auto;
}
.form-floating {
  width: 90%;
}
.add-comm-action-container {
  width: 88%;
}
.no-comments-section {
  height: 15rem;
}
.no-comments-img {
  width: 7rem;
}
.comment-container {
  position: relative;
}
.delete-comm-btn {
  position: absolute;
  bottom: 0.3rem;
  right: 0.3rem;
}
</style>
