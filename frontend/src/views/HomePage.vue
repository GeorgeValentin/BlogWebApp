<template>
  <!-- If not logged in then show all blog posts, but do not allow the user that sees them to do anything -->
  <div v-if="getLoggedInStatus === false">
    <!-- <home-app-description /> -->
    <blog-posts-list :blogPosts="getBlogPosts" />
  </div>

  <!-- Show the blog posts of the user that is logged in 
      - he will be able to add more posts
      - UPDATE/DELETE the existing -->
  <!-- -> also create a button in  the Menu called "community@ or something similar that allows the user that is logged in the other user's posts, comment and like them  -->
  <div v-else>
    <!-- <div v-for="blogPost in getBlogPosts" :key="blogPost.blogPostId">
    <div>---------</div>
    <div>{{ blogPost }}</div>
  </div> -->

    <blog-posts-list :blogPosts="getBlogPosts" />
  </div>
</template>

<script>
// @ is an alias to /src
// import DataService from "@/services/data.service";
import { mapGetters, mapActions } from "vuex";
import BlogPostsList from "@/components/BlogPostsList";
// import HomeAppDescription from "@/components/HomeAppDescription.vue";

export default {
  name: "HomeView",
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
    ]),
    // getBlogPostsOfUser: async function (userId) {
    //   if (this.getLoggedInUserData !== null) {
    //     await this.getBlogPostsOfLoggedInUser(this.getLoggedInUserData.userId);
    //   }
    // },
    getBlogPostsOfUser: async function (userId) {
      await this.getBlogPostsOfLoggedInUser(userId);
    },
    getAllBlogPosts: async function () {
      await this.getEntireListOfBlogPosts();
    },
    // -> to be implemented
    // getBlogPostsOfOthers: async function () {
    //   if (this.getLoggedInUserData !== null) {
    //     await this.getBlogPostsOfLoggedInUser(this.getLoggedInUserData.userId);
    //   }
    // },
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
