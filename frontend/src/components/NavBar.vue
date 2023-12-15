<template>
  <article id="nav-bar">
    <router-link to="/" id="home-link">
      <h1>Blogify</h1>
    </router-link>

    <nav-links :userEmail="userEmail" />
  </article>
</template>

<script>
import NavLinks from "./NavLinks";

export default {
  name: "NavBar",
  data() {
    return {
      userEmail: {},
    };
  },
  // -> lifecycle hook called after the Vue instance has been created but before it is mounted to the DOM
  // -> best for data fetching, settings up event listeners or other initializations
  created() {
    this.userEmail = localStorage.getItem("userEmail");
  },
  components: {
    NavLinks,
  },
};
</script>

<style scoped>
#nav-bar {
  border-bottom: 1px solid #ddd;
  height: 75px;
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
    height: 16vh;
  }

  #home-link {
    position: absolute;
    top: 6%;
  }
}
</style>
