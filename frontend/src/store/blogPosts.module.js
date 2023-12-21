import BlogPostsService from "@/services/blogPosts.service";

const initialState = {
  blogPostsList: [],
  blogPost: {
    author: "",
    blogPostId: "",
    category: "",
    name: "",
    comments: "",
    content: "",
    creationDate: "",
    likes: "",
    title: "",
  },
  getBlogPostStatus: false,
};

export const blogPostsModule = {
  // -> namespaced: true - good for avoiding naming conflicts as this module will be identified
  // by its name = blogPosts
  namespaced: true,
  state: initialState,
  actions: {
    getEntireListOfBlogPosts({ commit }) {
      return BlogPostsService.getAllBlogPostsEndpoint().then(
        (response) => {
          console.log(response);
          commit("getBlogPostsSuccess", response);
          return Promise.resolve(response);
        },
        (error) => {
          commit("getBlogPostsFailure");
          return Promise.reject(error);
        }
      );
    },
    getBlogPostsOfLoggedInUser({ commit }, userId) {
      return BlogPostsService.getBlogPostsOfLoggedInUser(userId).then(
        (response) => {
          commit("getBlogPostsSuccess", response);
          return Promise.resolve(response);
        },
        (error) => {
          commit("getBlogPostsFailure");
          return Promise.reject(error);
        }
      );
    },
    // getBlogPostById({ commit }, userId, blogPostId) {
    //   return BlogPostsService.getBlogPostById(userId, blogPostId).then(
    //     (response) => {
    //       commit("getBlogPostSuccess", response);
    //       return Promise.resolve(response);
    //     },
    //     (error) => {
    //       commit("getBlogPostFailure");
    //       return Promise.reject(error);
    //     }
    //   );
    // },
  },
  mutations: {
    getBlogPostsSuccess(state, blogPosts) {
      state.blogPostsList = blogPosts.data;
      state.getBlogPostStatus = true;
    },
    getBlogPostsFailure(state) {
      state.getBlogPostStatus = false;
    },
    // getBlogPostSuccess(state, blogPost) {
    //   this.blogPost = blogPost.data;
    //   state.getBlogPostStatus = true;
    // },
    // getBlogPostFailure(state) {
    //   state.getBlogPostStatus = false;
    // },
    // getBlogPostsOfLoggedInUserSuccess(state, blogPosts) {
    //   state.blogPostsList = blogPosts.data;
    //   state.getBlogPostStatus = true;
    // },
    // getBlogPostsOfLoggedInUserFailure(state) {
    //   state.getBlogPostStatus = false;
    // },
  },
  getters: {
    getBlogPosts: (state) => {
      return state.blogPostsList;
    },
    // getBlogPost: (state) => {
    //   return state.blogPost;
    // },
  },
};
