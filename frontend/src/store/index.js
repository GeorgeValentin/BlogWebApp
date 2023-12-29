import { createStore } from "vuex";
import { auth } from "./auth.module";
import { blogPostsModule } from "./blogPosts.module";

const store = createStore({
  modules: {
    auth,
    blogPostsModule,
  },
});

export default store;

// -> kept as a reference
// // -> a Vuex store is created by defining a set of data, mutations, actions, and getters
// // -> these components work together to manage and manipulate the application state

// import { createStore } from "vuex";

// const store = createStore({
//   state: {
//     // Your application state goes here
//     count: 0,
//   },
//   mutations: {
//     // Mutations are responsible for changing the state since the state is read-only
//     increment(state) {
//       state.count++;
//     },
//     decrement(state) {
//       state.count--;
//     },
//   },
//   actions: {
//     // Actions are used to commit mutations asynchronously
//     incrementAsync({ commit }) {
//       setTimeout(() => {
//         commit("increment");
//       }, 1000);
//     },
//   },
//   getters: {
//     // Getters are used to retrieve state data with computed properties
//     getCount: (state) => state.count,
//   },
// });

// export default store;
