<template>
  <div>Hello World</div>
  {{ getLoggedInStatus }}
</template>

<script>
// @ is an alias to /src
import { mapGetters } from "vuex";

export default {
  name: "HomeView",
  computed: {
    ...mapGetters("auth", ["getLoggedInStatus"]),
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
