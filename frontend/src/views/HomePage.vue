<template>
  <!-- Show all Blog Posts (Read-Only) -->
  <div v-if="getLoggedInStatus === false">
    <search-blog-posts
      @searchRecords="searchBlogs"
      :myKey="filterKey"
      :myDir="filterDir"
      @requestKey="changeKey"
      @requestDir="changeDir"
    />

    <blog-posts-list
      :blogPosts="filteredBlogPosts"
      pageName="home"
      :errorMsg="errorMessage"
      :loadingStatus="loadingStatus"
    />
  </div>

  <!-- Show user's blog post (read/write, must be logged in) -->
  <!-- -> Make the "Community" button to allow the user that is logged in
  to comment on other user's posts -->
  <div v-else class="logged-in-blog-posts-list">
    <search-blog-posts
      @searchRecords="searchBlogs"
      :myKey="filterKey"
      :myDir="filterDir"
      @requestKey="changeKey"
      @requestDir="changeDir"
    />

    <blog-posts-list
      :blogPosts="filteredBlogPosts"
      pageName="home"
      @delete="handleDeleteBlogPost"
      @edit="handleEditBlogPost"
      :errorMsg="errorMessage"
      :loadingStatus="loadingStatus"
    />
  </div>
</template>

<script>
// @ is an alias to /src
import { mapGetters, mapActions } from "vuex";
import BlogPostsList from "@/components/BlogPostsList";
import { filterErrorMessages } from "@/utils/utility";
import SearchBlogPosts from "@/components/SearchBlogPosts";
import _ from "lodash";

export default {
  name: "HomePage",
  data() {
    return {
      errorMessage: "",
      loadingStatus: true,
      searchTerms: "",
      filterKey: "title",
      filterDir: "asc",
    };
  },
  components: { BlogPostsList, SearchBlogPosts },
  computed: {
    ...mapGetters("auth", ["getLoggedInStatus", "getLoggedInUserData"]),
    ...mapGetters("blogPostsModule", ["getBlogPosts"]),
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
    // -> get the logged in user's blog posts
    if (this.getLoggedInStatus === true) {
      if (this.getLoggedInUserData !== null) {
        this.getBlogPostsOfUser(this.getLoggedInUserData.userId);
      }
    } else {
      // -> get all blog posts of all user's
      this.getAllBlogPosts();
    }
  },
  methods: {
    ...mapActions("blogPostsModule", [
      "getBlogPostsOfLoggedInUser",
      "getEntireListOfBlogPosts",
      "deleteBlogPost",
    ]),
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
    getBlogPostsOfUser: async function (userId) {
      try {
        await this.getBlogPostsOfLoggedInUser(userId);
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
    getAllBlogPosts: async function () {
      try {
        await this.getEntireListOfBlogPosts();
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
    handleDeleteBlogPost: async function (userId, blogPostId) {
      try {
        await this.deleteBlogPost({ userId, blogPostId });
      } catch (error) {
        if (error.response.status === 401 || error.response.status === 403) {
          this.handleLogout();
        }
        this.errorMessage = filterErrorMessages(error.response.status);
      }
    },
    handleEditBlogPost: function (blogPostsId) {
      try {
        this.$router.push(
          `/blogPostPage/${blogPostsId}/blogPostOwner/${this.getLoggedInUserData.userId}`
        );
      } catch (error) {
        console.log(error);
        this.errorMessage = filterErrorMessages(error);
      }
    },
  },
};

// -> vuex reference
// import HelloWorld from "@/components/HelloWorld.vue";
// import { mapState, mapActions, mapMutations } from "vuex";

// export default {
//   name: "HomeView",
//   components: {
//     HelloWorld,
//   },
//   // - "computed" = computed property
//   // -> derived from one or more data properties and are cached based on their dependencies
//   // and only recalculated when those dependencies change
//   // -> more efficient for handling reactive data
//   // -> they automatically update whenever their dependencies change
//   computed: {
//     // -> use this to access the count property of the store object
//     // -> another way of writing it: yourState() { return this.$store.state.count }
//     ...mapState(["count"]),
//   },

//   // -> methods, are called every time they are referenced in the template
//   methods: {
//     // -> this maps the mutations defined in the vuex store to methods in the component called how they are specified in []
//     ...mapMutations(["increment", "decrement"]),

//     // -> this maps the actions defined in the vuex store to methods in the component called how they are specified in []
//     ...mapActions(["incrementAsync"]),
//   },
// };
</script>

<style scoped>
.logged-in-blog-posts-list {
  padding: 2rem;
}
</style>
