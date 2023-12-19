<template>
  <article class="container-fluid">
    <!-- User is logged in -->
    <div
      v-if="getLoggedInStatus === true"
      class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3"
    >
      User is Logged in
    </div>

    <div
      v-else
      class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3"
    >
      <header>
        <h2 class="fw-bold fs-2 m-0">
          All Blog Posts since you have last visited!!!
        </h2>
      </header>

      <!-- Button to use to navigate to the "Add a Blog Post Page" -->
      <!-- <div class="text-center">
        <button
          type="button"
          class="btn btn-outline-dark fw-bold fs-5 border border-3 border-dark"
          @click="navigateToAddAuthorPage()"
        >
          +
        </button>
      </div> -->
    </div>

    <div class="row justify-content-center py-3 px-0">
      <div
        class="card-container text-center col-xxl-6 col-xl-4 col-md-12 col-sm-4 p-0"
        v-for="blogPost in blogPosts"
        :key="blogPost.blogPostId"
      >
        <div class="card border-2 border-light rounded-0" style="width: 20rem">
          <!-- Blog Post Avatar -> We'll see if we'll add it -->
        </div>

        <div class="card-body">
          <header>
            <h5 class="card-title fs-4 fw-bold mb-5 mt-2">
              {{ blogPost.title }}
            </h5>

            <h5 class="card-title fs-4 fw-bold mb-5 mt-2">
              {{ blogPost.author }}
            </h5>

            <h5 class="card-title fs-4 fw-bold mb-5 mt-2">
              {{ blogPost.category.name }}
            </h5>

            <h5 class="card-title fs-4 fw-bold mb-5 mt-2">
              {{ blogPost.creationDate }}
            </h5>

            <h5 class="card-title fs-4 fw-bold mb-5 mt-2">
              {{ blogPost.likes }}
            </h5>
          </header>

          <div
            class="d-flex justify-content-between align-items-center border border-2 border-light p-2 my-2"
          ></div>
        </div>
      </div>
    </div>
  </article>
</template>

<script>
// import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { mapGetters } from "vuex";

export default {
  name: "BlogPostsList",
  props: ["blogPosts"],
  computed: {
    ...mapGetters("auth", ["getLoggedInStatus", "getLoggedInUserData"]),
  },
  methods: {},
  //   components: { FontAwesomeIcon },
};
</script>

<style scoped>
.card-container {
  flex-basis: fit-content;
}

.card-container:hover {
  scale: 1.02;
}

.card {
  background-color: #0c2461;
  color: #c7ecee;
}

.card:hover {
  background-color: #0a3d62;
  color: #dff9fb;
}
</style>
