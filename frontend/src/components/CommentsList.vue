<template>
  <article class="mt-3">
    <span class="fw-bold fs-5"> Comments Section!</span>

    <div class="comments-section">
      <div
        class="comment-section p-2"
        v-for="comment in commentsList"
        :key="comment.commentId"
      >
        <section
          class="comment-entry border border-2 border-dark fs-6 mb-2 w-75 m-auto"
        >
          <div class="text-center fw-bold fst-italic fs-5">
            "{{ comment.content }}"
          </div>

          <div
            class="comment-details-container d-flex justify-content-between align-items-end"
          >
            <div class="d-flex justify-content-center align-items-center gap-2">
              <font-awesome-icon icon="user" />
              <span>{{ comment.authorName }}</span>
            </div>

            <div class="d-flex justify-content-center align-items-center gap-2">
              <font-awesome-icon icon="calendar-day" />
              <span>{{ comment.lastModifiedAt }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>

    <div class="add-comment-container mt-2">
      <div
        class="add-comment-element d-flex justify-content-center align-items-center gap-2"
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

        <button
          v-if="getLoggedInStatus === true && getLoggedInUserData !== null"
          class="d-flex justify-content-center align-items-center flex-row gap-2 btn btn-primary border border-2 border-primary"
          @click="addComment"
        >
          <font-awesome-icon icon="fa-plus" />
          <span class="fw-bold">Add</span>
        </button>
      </div>

      <div class="remaining-character-element">
        {{ remainingCharacters }} characters left
      </div>
    </div>
  </article>
</template>

<script>
import { mapGetters } from "vuex";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
// import AlertMessage from "@/components/AlertMessage";
// import LoadingSpinner from "./LoadingSpinner";

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
  max-height: 15rem;
  overflow: auto;
}

.comment-entry {
  border-radius: 0.25rem;
  padding-top: 0.5rem;
}

.comment-details-container {
  padding: 1.25rem 1rem 0.5rem;
}

.add-comment-container {
  position: relative;
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

.remaining-character-element {
  position: absolute;
  right: 10rem;
}
</style>
