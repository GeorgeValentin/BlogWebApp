<template>
  <!-- Show all Blog Posts (Read-Only) -->
  <div v-if="getLoggedInStatus === false">
    <blog-posts-list
      :blogPosts="getBlogPosts"
      pageName="home"
      :errorMsg="errorMessage"
    />
  </div>

  <!-- Show user's blog post (read/write, must be logged in) -->
  <!-- -> Make the "Community" button to allow the user that is logged in
  to comment on other user's posts -->
  <div v-else>
    <blog-posts-list
      :blogPosts="getBlogPosts"
      pageName="home"
      @delete="handleDeleteBlogPost"
      @edit="handleEditBlogPost"
      :errorMsg="errorMessage"
    />
  </div>
</template>

<script>
// @ is an alias to /src
import { mapGetters, mapActions } from "vuex";
import BlogPostsList from "@/components/BlogPostsList";
import { filterErrorMessages } from "../utils/utility";

export default {
  name: "HomePage",
  data() {
    return {
      errorMessage: "",
    };
  },
  components: { BlogPostsList },
  computed: {
    ...mapGetters("auth", ["getLoggedInStatus", "getLoggedInUserData"]),
    ...mapGetters("blogPostsModule", ["getBlogPosts"]),
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
    getBlogPostsOfUser: async function (userId) {
      try {
        await this.getBlogPostsOfLoggedInUser(userId);
      } catch (error) {
        console.log(error);
        this.errorMessage = filterErrorMessages(error.response.status);
      }
    },
    getAllBlogPosts: async function () {
      try {
        await this.getEntireListOfBlogPosts();
      } catch (error) {
        console.log(error);
        this.errorMessage = filterErrorMessages(error.response.status);
      }
    },
    handleDeleteBlogPost: async function (userId, blogPostId) {
      try {
        await this.deleteBlogPost({ userId, blogPostId });
      } catch (error) {
        console.log(error);
        this.errorMessage = filterErrorMessages(error.response.status);
      }
    },
    handleEditBlogPost: function (blogPostsId) {
      try {
        this.$router.push(`/blogPostPage/${blogPostsId}`);
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
