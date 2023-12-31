<template>
  <search-blog-posts
    @searchRecords="searchBlogs"
    :myKey="filterKey"
    :myDir="filterDir"
    @requestKey="changeKey"
    @requestDir="changeDir"
  />

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
import SearchBlogPosts from "@/components/SearchBlogPosts";
import _ from "lodash";

export default {
  name: "CommunityPage",
  components: { BlogPostsList, SearchBlogPosts },
  data() {
    return {
      errorMessage: "",
      loadingStatus: true,
      filterKey: "title",
      filterDir: "asc",
    };
  },
  computed: {
    ...mapGetters("auth", ["getLoggedInStatus", "getLoggedInUserData"]),
    ...mapGetters("blogPostsModule", ["getBlogPostsCommunity"]),
    searchedBlogPosts: function () {
      return this.getBlogPosts.filter((item) => {
        return (
          item.title.toLowerCase().match(this.searchTerms.toLowerCase()) ||
          item.category.toLowerCase().match(this.searchTerms.toLowerCase())
        );
      });
    },
    filteredBlogPosts: function () {
      return _.orderBy(
        this.searchedBlogPosts,
        (item) => {
          return item[this.filterKey].toLowerCase();
        },
        this.filterDir
      );
    },
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
    changeKey: function (value) {
      this.filterKey = value;
    },
    changeDir: function (value) {
      this.filterDir = value;
    },
    searchBlogs: function (terms) {
      this.searchTerms = terms;
    },
    handleLogout: function () {
      this.logout();
      this.$router.push("/login");
    },
    getBlogPostsOfOthers: async function (userId) {
      try {
        await this.getBlogPostsOfCommunity(userId);
        this.loadingStatus = false;
      } catch (error) {
        if (error.response.status === 401 || error.response.status === 403) {
          this.handleLogout();
        }
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
