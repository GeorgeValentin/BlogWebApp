<template>
  <div v-if="loadingStatus === true">
    <loading-spinner />
  </div>

  <article class="container-fluid" v-else>
    <!-- Community Page Title -->
    <div
      v-if="pageName === 'community'"
      class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3">
      <header>
        <h2 class="fw-bold fs-2 m-0">Community - What others are Posting</h2>

        <div v-if="errorMsg !== ''">
          <div class="position-absolute error-message-community">
            <alert-message :msg="errorMsg" alertType="alert-danger" />
          </div>
        </div>
      </header>
    </div>

    <div v-else>
      <!-- Logged In User Title -->
      <div
        v-if="getLoggedInStatus === true"
        class="position-relative d-flex justify-content-center align-items-center gap-3 mt-4 mb-3">
        <header>
          <h2 class="fw-bold fs-2 m-0">
            The Blog Posts of User "{{ getLoggedInUserData.username }}"
          </h2>

          <div v-if="errorMsg !== ''">
            <div class="position-absolute error-message-home">
              <alert-message :msg="errorMsg" alertType="alert-danger" />
            </div>
          </div>
        </header>
      </div>

      <div
        v-else
        class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3">
        <!-- No one logged in Title -->
        <header>
          <h2 class="fw-bold fs-2 m-0">Blog Posts</h2>
        </header>
      </div>
    </div>

    <div
      v-if="blogPosts.length === 0"
      class="fw-bold fs-4 fst-italic w-25 missing-blog-posts-container">
      <img
        class="missing-blog-posts-img mb-3"
        src="../assets/noPosts.png"
        alt="missing-blog-posts" />

      <p>No Blog Posts found at the moment!</p>
    </div>

    <div
      class="flex-outer-container row justify-content-center py-5 px-5 gap-4">
      <div
        class="card-container text-center col-xxl-6 col-xl-4 col-md-12 col-sm-4 p-0"
        v-for="blogPost in blogPosts"
        :key="blogPost.blogPostId">
        <div class="card border-2 border-light rounded" style="width: 20rem">
          <div class="card-body">
            <div v-if="pageName === 'home' && getLoggedInStatus === true">
              <div
                class="action-btns-container d-flex justify-content-center align-items-center">
                <button
                  class="delete-btn btn btn-danger border border-danger border-2"
                  @click="
                    $emit(
                      'delete',
                      getLoggedInUserData.userId,
                      blogPost.blogPostId
                    )
                  ">
                  <font-awesome-icon icon="trash" />
                </button>

                <button
                  class="update-btn btn btn-warning text-dark border border-2 border-warning"
                  @click="$emit('edit', blogPost.blogPostId)">
                  <font-awesome-icon icon="pen-to-square" />
                </button>
              </div>
            </div>

            <header
              class="card-title d-flex justify-content-center align-items-center gap-5">
              <div
                class="element-with-img-container fs-5 fw-bold d-flex justify-content-center align-items-center gap-2">
                <img
                  src="../assets/blogger.png"
                  alt="blogger-img"
                  class="blogger-img" />
                <div class="fst-italic fs-5 fw-bold">
                  {{ blogPost.authorName }}
                </div>
              </div>

              <div class="blog-post-title fs-6 fst-italic">
                <div>"{{ capitalizeTitle(blogPost.title) }}"</div>
              </div>

              <div
                class="element-with-img-container d-flex justify-content-center align-items-center gap-2">
                <img
                  class="category-img"
                  src="../assets/blog.png"
                  alt="category-img" />

                <div class="fs-6">
                  {{ blogPost.category }}
                </div>
              </div>
            </header>

            <div class="creation-date-container fs-6 fst-italic">
              {{ blogPost.lastModifiedAt }}
            </div>

            <div
              class="comments-container fs-6 fw-bold fst-italic d-flex justify-content-center align-items-center gap-2">
              <font-awesome-icon icon="comment" />

              {{ blogPost.comments.length }}
            </div>

            <div
              class="content-container d-flex flex-column justify-content-between align-items-center border border-2 border-dark rounded p-2 my-2">
              <div class="content fs-6 fw-bold fst-italic">
                "{{ formatBlogPostContent(blogPost.content) }}"
                <span class="fw-bold fst-italic">...</span>
              </div>
            </div>

            <!-- Navigate to Blog Post page where the user can read it all (must be logged in)-->
            <button
              class="read-more-btn fw-bold"
              @click="handleReadMore(blogPost.blogPostId, blogPost.authorId)">
              Read More
            </button>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script>
import { mapGetters } from "vuex";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import AlertMessage from "@/components/AlertMessage";
import LoadingSpinner from "./LoadingSpinner";

export default {
  name: "BlogPostsList",
  props: ["blogPosts", "pageName", "errorMsg", "loadingStatus"],
  // -> componente utilizate in cadrul acestei componente
  components: {
    FontAwesomeIcon,
    AlertMessage,
    LoadingSpinner,
  },
  // -> variabilele componentei
  data() {
    return {
      contentSize: 36,
    };
  },
  // -> similare cu metodele, ce definim aici se va reevalua (reexecuta) cand datele utilizate se modifica
  computed: {
    // -> aici extragem datele din modului vuex auth, getLoggedInStatus si getLoggedInUserData
    // -> de fiecare data cand acele date se vor modifica, acest getter se va reexecuta
    // -> un alt fel de a scrie asta:
    // loggedInStatus() {
    //    return this.$store.getters["auth/getLoggedInStatus"];
    // },
    ...mapGetters("auth", ["getLoggedInStatus", "getLoggedInUserData"]),
  },
  methods: {
    // -> metoda care ia continutul si il face sa aiba doar 36 de cuvinte
    formatBlogPostContent(content) {
      let arrOfContentWords = content.split(" ");
      return arrOfContentWords.slice(0, this.contentSize).join(" ");
    },
    // -> metoda care face cuvantul sa inceapa cu litara mare
    capitalizeTitle(title) {
      return title.charAt(0).toUpperCase() + title.substring(1);
    },
    // -> metoda de read more
    handleReadMore(blogPostId, authorId) {
      // -> userul nu e logat
      if (this.getLoggedInStatus === false) {
        // du-te la pagina de login
        this.$router.push("/login");
      }
      // -> userul e logat
      else {
        // -> du-te la pagina de BlogPost (paseaza si id-urile blogPost-ului si al autorului)
        this.$router.push(
          `/blogPostPage/${blogPostId}/blogPostOwner/${authorId}`
        );
      }
    },
  },
};
</script>

<style scoped>
.card-container {
  flex-basis: fit-content;
  position: relative;
}

.card {
  background-color: #f6e58d;
  color: #000;
  height: 20rem;
  width: 28rem !important;
}

.card-title {
  margin-top: 0.35rem;
}

.content-container {
  height: 12.5rem;
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

.comments-container {
  position: absolute;
  bottom: 0.55rem;
  left: 44%;
}

.comments-img {
  width: 1.25rem;
}

.category-img {
  height: 1.4rem;
}

.blogger-img {
  width: 1.25rem;
}

.action-btns-container {
  position: relative;
  height: 1.25rem;
}

.delete-btn {
  position: absolute;
  left: 0;
}

.update-btn {
  position: absolute;
  right: 0;
}

.delete-img {
  width: 2rem;
}

.update-img {
  width: 2rem;
}

.missing-blog-posts-container {
  margin: 7rem auto;
}

.missing-blog-posts-img {
  width: 10rem;
}

.error-message-home {
  right: 5%;
  bottom: -33px;
}

.error-message-community {
  right: 4%;
  top: 7%;
}

@media (max-width: 1024px) {
  .card {
    height: 22rem;
    width: 27em !important;
  }
  .card-title {
    gap: 1.5rem !important;
    margin-bottom: 1.5rem !important;
    margin-top: 1rem !important;
  }
  .element-with-img-container {
    gap: 0.5rem !important;
  }
  .blog-post-title {
    font-size: 1.1rem !important;
  }
}

@media (max-width: 850px) {
  .flex-outer-container {
    padding-inline: 1.5rem !important;
  }
  .card {
    width: 22.5rem !important;
  }
}

@media (max-width: 500px) {
  .flex-outer-container {
    padding: 2rem 0 0 !important;
  }

  .element-with-img-container {
    gap: 0.35rem !important;
  }

  .element-with-img-container > div {
    font-size: 0.9rem !important;
  }

  .blog-post-title {
    font-size: 0.9rem !important;
  }
}
</style>
