<template>
  <article id="nav-bar">
    <router-link to="/" id="home-link">
      <h1>Blogify</h1>
    </router-link>

    <nav-links :userEmail="getLoggedInUserEmail" />
  </article>
</template>

<script>
import NavLinks from "./NavLinks";
import { mapGetters } from "vuex";

export default {
  name: "NavBar",
  data() {
    return {
      userEmail: {},
    };
  },
  // -> lifecycle hook called after the Vue instance has been created but before it is mounted to the
  // DOM
  // -> best for data fetching, settings up event listeners or other initializations
  created() {
    this.userEmail = localStorage.getItem("userEmail");
  },
  computed: {
    ...mapGetters("auth", ["getLoggedInStatus", "getLoggedInUserEmail"]),
  },
  components: {
    NavLinks,
  },
};
</script>

<style scoped>
#nav-bar {
  border-bottom: 1px solid #ddd;
  height: 6vh;
  width: 100%;
}

#home-link {
  text-align: center;
  display: block;
  color: rgb(43, 95, 226);
  font-size: 22px;
  left: 32px;
  position: absolute;
  top: 16px;
  text-decoration: none;
}

#home-link h1 {
  margin: 0;
  font-weight: 700;
}

@media (max-width: 500px) {
  #nav-bar {
    margin-bottom: 2rem;
    height: 12vh;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  #home-link {
    position: static;
    top: 6%;
  }
}
</style>
