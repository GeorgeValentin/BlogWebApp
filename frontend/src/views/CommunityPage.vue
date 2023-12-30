<template>
  <blog-posts-list
    :blogPosts="getBlogPostsCommunity"
    pageName="community"
    :errorMsg="errorMessage"
    :loadingStatus="loadingStatus"
  />
</template>

<script>
import BlogPostsList from "@/components/BlogPostsList";
import { mapGetters, mapActions } from "vuex";
import { filterErrorMessages } from "@/utils/utility";

export default {
  name: "CommunityPage",
  components: { BlogPostsList },
  data() {
    return {
      errorMessage: "",
      loadingStatus: true,
    };
  },
  computed: {
    ...mapGetters("auth", ["getLoggedInStatus", "getLoggedInUserData"]),
    ...mapGetters("blogPostsModule", ["getBlogPostsCommunity"]),
  },
  created() {
    // -> get the blog posts of the other users (not the logged in one)
    if (this.getLoggedInStatus === true) {
      if (this.getLoggedInUserData !== null) {
        this.getBlogPostsOfOthers(this.getLoggedInUserData.userId);
      }
    }
  },
  mounted() {
    if (this.getLoggedInStatus === false && this.getLoggedInUserData === null) {
      this.$router.push("/");
    }
  },
  methods: {
    ...mapActions("blogPostsModule", ["getBlogPostsOfCommunity"]),
    getBlogPostsOfOthers: async function (userId) {
      try {
        await this.getBlogPostsOfCommunity(userId);
        this.loadingStatus = false;
      } catch (error) {
        this.loadingStatus = true;
        this.errorMessage = filterErrorMessages(error.response.status);
      } finally {
        this.loadingStatus = false;
      }
    },
  },
};
</script>

<style scoped></style>
