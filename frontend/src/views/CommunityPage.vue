<template>
  <blog-posts-list :blogPosts="getBlogPosts" pageName="community" />
</template>

<script>
import BlogPostsList from "@/components/BlogPostsList";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "CommunityPage",
  components: { BlogPostsList },
  computed: {
    ...mapGetters("auth", ["getLoggedInStatus", "getLoggedInUserData"]),
    ...mapGetters("blogPostsModule", ["getBlogPosts"]),
  },
  created() {
    // -> get the blog posts of the other users (not the logged in one)
    if (this.getLoggedInStatus === true) {
      if (this.getLoggedInUserData !== null) {
        this.getBlogPostsOfOthers(this.getLoggedInUserData.userId);
      }
    }
  },
  methods: {
    ...mapActions("blogPostsModule", ["getBlogPostsOfCommunity"]),
    getBlogPostsOfOthers: async function (userId) {
      await this.getBlogPostsOfCommunity(userId);
    },
  },
};
</script>

<style scoped></style>
