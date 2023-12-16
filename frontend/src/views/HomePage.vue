<template>
  <!-- <article>{{ getLoggedInUserData.userId }}</article> -->

  <div v-if="getLoggedInStatus === false">
    You must first login into the app to be able to use it!

    <home-app-description />
  </div>

  <div v-else>
    <div>Blog Posts:</div>

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
import HomeAppDescription from "@/components/HomeAppDescription.vue";

export default {
  name: "HomeView",
  components: { BlogPostsList, HomeAppDescription },
  computed: {
    ...mapGetters("auth", ["getLoggedInStatus", "getLoggedInUserData"]),
    ...mapGetters("blogPostsModule", ["getBlogPosts"]),
  },
  created() {
    if (this.getLoggedInStatus === true) {
      this.getBlogPostsOfUser();
    } else {
      // call the method that gets other people's blog posts
    }
  },
  methods: {
    ...mapActions("blogPostsModule", ["getBlogPostsOfLoggedInUser"]),
    getBlogPostsOfUser: async function () {
      if (this.getLoggedInUserData !== null) {
        await this.getBlogPostsOfLoggedInUser(this.getLoggedInUserData.userId);
      }
    },
    getBlogPostsOfOthers: async function () {
      if (this.getLoggedInUserData !== null) {
        await this.getBlogPostsOfLoggedInUser(this.getLoggedInUserData.userId);
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
