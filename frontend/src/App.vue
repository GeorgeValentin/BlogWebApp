<template>
  <NavBar />

  <router-view />
</template>

<script>
import NavBar from "./components/NavBar";
import AuthService from "./services/auth.service";

export default {
  name: "App",
  components: {
    NavBar,
  },
  // -> lifecycle hook that is called after the component has been mounted (= inserted into the DOM),
  // useful if you need to interact with the DOm after it has been fully rendered
  // -> I am trying to
  mounted() {
    const currentDate = new Date();
    const tokenData = localStorage.getItem("tokenResponse");
    const jsonToken = JSON.parse(tokenData);
    if (jsonToken !== null) {
      const tokenExpiry = jsonToken.expiry;

      if (
        tokenExpiry + 3600 <
        new Date(currentDate).setHours(currentDate.getHours())
      ) {
        AuthService.logout();
        location.reload();
      } else {
        const reloaded = localStorage.getItem("reloaded");
        if (
          reloaded === "true" ||
          reloaded === undefined ||
          reloaded === null
        ) {
          localStorage.setItem("reloaded", "false");
          location.reload();
        }
      }
    }
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
}

.page-element {
  height: 86vh;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

@media (max-width: 500px) {
  .page-element {
    height: 84vh;
  }
}
</style>
