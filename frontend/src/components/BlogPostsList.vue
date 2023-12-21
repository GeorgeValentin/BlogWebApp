<template>
  <article class="container-fluid">
    <!-- User is logged in -->
    <div
      v-if="getLoggedInStatus === true"
      class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3"
    >
      <header>
        <h2 class="fw-bold fs-2 m-0">Blog Posts of logged in user</h2>
      </header>

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

    <div
      class="flex-outer-container row justify-content-center py-5 px-5 gap-4"
    >
      <div
        class="card-container text-center col-xxl-6 col-xl-4 col-md-12 col-sm-4 p-0"
        v-for="blogPost in blogPosts"
        :key="blogPost.blogPostId"
      >
        <div class="card border-2 border-light rounded" style="width: 20rem">
          <!-- Blog Post Avatar -> We'll see if we'll add it -->

          <div class="card-body">
            <header
              class="card-title d-flex justify-content-between align-items-center"
            >
              <div
                class="fs-5 fw-bold d-flex justify-content-center align-items-center gap-2"
              >
                <img
                  src="../assets/blogger.png"
                  alt="blogger-img"
                  class="blogger-img"
                />
                <div class="fst-italic fs-5 fw-bold">
                  {{ blogPost.authorName }}
                </div>
              </div>

              <div
                class="d-flex justify-content-center align-items-center gap-2"
              >
                <img
                  class="category-img"
                  src="../assets/blog.png"
                  alt="category-img"
                />

                <div class="fs-6">
                  {{ blogPost.category.name }}
                </div>
              </div>
            </header>

            <div class="blog-post-title-container fs-6 fst-italic">
              "{{ capitalizeTitle(blogPost.title) }}"
            </div>

            <div class="creation-date-container fs-6 fst-italic">
              {{ blogPost.creationDate }}
            </div>

            <div
              class="like-container fs-6 fw-bold fst-italic d-flex justify-content-center align-items-center gap-2"
            >
              <img class="like-img" src="../assets/like.png" alt="like-img" />
              {{ blogPost.likes }}
            </div>

            <div
              class="content-container d-flex flex-column justify-content-between align-items-center border border-2 border-dark rounded p-2 my-2"
            >
              <div class="content fs-6 fw-bold fst-italic">
                <!-- "{{ blogPost.content }}" -->

                "{{ formatBlogPostContent(blogPost.content) }}"
                <span class="fw-bold fst-italic">...</span>
              </div>
            </div>

            <!-- Navigate to Blog Post page where the user can read it all (must be logged in)-->
            <button
              class="read-more-btn fw-bold"
              @click="handleReadMore(blogPost.blogPostId)"
            >
              Read More
            </button>
          </div>
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
  data() {
    return {
      contentSize: 36,
    };
  },
  computed: {
    ...mapGetters("auth", ["getLoggedInStatus", "getLoggedInUserData"]),
  },
  methods: {
    formatBlogPostContent(content) {
      let arrOfContentWords = content.split(" ");
      return arrOfContentWords.slice(0, this.contentSize).join(" ");
    },
    capitalizeTitle(title) {
      return title.charAt(0).toUpperCase() + title.substring(1);
    },
    handleReadMore(blogPostId) {
      if (this.getLoggedInStatus === false) {
        // navigate to login
        this.$router.push("/login");
      } else {
        // navigate to BlogPost Page
        this.$router.push(`/blogPostPage/${blogPostId}`);
      }
    },
  },
  //   components: { FontAwesomeIcon },
};
</script>

<style scoped>
.card-container {
  flex-basis: fit-content;
  position: relative;
}

/* .card-container:hover {
  scale: 1.02;
} */

.card {
  background-color: #f6e58d;
  color: #000;
  height: 19rem;
  width: 32rem !important;
}

.content-container {
  height: 13rem;
}

.content {
  text-align: justify;
  height: 100%;
}

.read-more-btn {
  margin-top: 2rem;
  color: #22a6b3 !important;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: transparent;
  border: none;
  position: absolute;
  bottom: 0.15rem;
  right: 1rem;
}

.read-more-btn:hover {
  color: #7ed6df !important;
}

.creation-date-container {
  position: absolute;
  bottom: 0.55rem;
  left: 1.1rem;
}

.like-container {
  position: absolute;
  bottom: 0.55rem;
  left: 44%;
}

.blog-post-title-container {
  position: absolute;
  top: 1.2rem;
  left: 45%;
}

.like-img {
  width: 1.25rem;
}

.category-img {
  width: 1.4rem;
}

.blogger-img {
  width: 2rem;
}

@media (max-width: 850px) {
  .flex-outer-container {
    padding-inline: 1.5rem !important;
  }
  .card {
    width: 22.5rem !important;
  }
}
</style>
