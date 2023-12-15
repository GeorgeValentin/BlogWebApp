<template>
  <article
    class="nav-links-container d-flex justify-content-end align-items-center gap-3"
  >
    <div
      v-if="userEmail !== null"
      class="logged-in-links-container d-flex justify-content-center align-items-center gap-2"
    >
      <div class="fst-italic fs-5">
        Hello <span class="fw-bold text-dark">{{ userEmail }}</span>
      </div>

      <router-link to="/" id="logout-btn-container" class="nav-link">
        <button
          class="btn btn-dark fw-bold border border-dark border-3"
          @click="logout"
        >
          Logout
        </button>
      </router-link>
    </div>

    <div
      class="auth-links-container d-flex justify-content-center align-items-center gap-2"
      v-else
    >
      <router-link to="/register" id="register-btn-container" class="nav-link">
        <button class="btn btn-primary fw-bold border border-primary border-3">
          <font-awesome-icon icon="user-plus" />
          Register
        </button>
      </router-link>

      <router-link to="/login" id="login-btn-container" class="nav-link">
        <button
          class="btn btn-outline-primary fw-bold border border-primary border-3"
        >
          <font-awesome-icon icon="lock-open" />
          Login
        </button>
      </router-link>
    </div>
  </article>
</template>

<script>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

export default {
  name: "NavLinks",
  components: {
    FontAwesomeIcon,
  },
  props: ["userEmail"],
  methods: {
    logout: function () {
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
.nav-links-container {
  position: absolute;
  right: 0;
  top: 1rem;
  margin: auto 2rem auto;
}

@media (max-width: 500px) {
  .auth-links-container {
    flex-direction: column;
  }

  .logged-in-links-container {
    flex-direction: column;
    position: absolute;
    top: 0.8rem;
    width: 13rem;
  }
}
</style>
