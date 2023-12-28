<template>
  <div>{{ this.getBlogPost }}</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "BlogPostPage",
  data() {
    return {
      blogPostId: "",
      blogPost: {},
    };
  },
  computed: {
    ...mapGetters("auth", ["getLoggedInStatus", "getLoggedInUserData"]),
    ...mapGetters("blogPostsModule", ["getBlogPost"]),
  },
  created() {
    this.blogPostId = this.$route.params.blogPostId;

    if (
      this.getLoggedInStatus !== false &&
      this.getLoggedInUserData !== undefined
    ) {
      this.getBlogPostById(this.getLoggedInUserData.userId, this.blogPostId);
    }
  },
  methods: {
    ...mapActions("blogPostsModule", ["getBlogPostByIdOfLoggedInUser"]),

    // -> when you have more than one argument to pass to vuex module pass it as object or an array
    // since vuex "dispatching" can only take two args: 1. the name of the action and 2. the payload
    getBlogPostById: async function (userId, blogPostId) {
      await this.getBlogPostByIdOfLoggedInUser({
        userId,
        blogPostId,
      });
    },
  },
};
</script>

<style scoped></style>
