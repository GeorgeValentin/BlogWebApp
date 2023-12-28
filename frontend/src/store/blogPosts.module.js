import BlogPostsService from "@/services/blogPosts.service";

const initialState = {
  blogPostsList: [],
  blogPost: {},
  getBlogPostStatus: false,
  updatedBlogPostStatus: false,
  deleteBlogPostStatus: false,
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
    getBlogPostsOfCommunity({ commit }, userId) {
      return BlogPostsService.getBlogPostsOfOthers(userId).then(
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
    getBlogPostByIdOfLoggedInUser({ commit }, { userId, blogPostId }) {
      return BlogPostsService.getBlogPostById(userId, blogPostId).then(
        (response) => {
          commit("getBlogPostByIdSuccess", response);
          return Promise.resolve(response);
        },
        (error) => {
          commit("getBlogPostByIdFailure");
          return Promise.reject(error);
        }
      );
    },
    updateBlogPost({ commit }, { userId, blogPostId, blogPostToUpdate }) {
      return BlogPostsService.editBlogPost(
        userId,
        blogPostId,
        blogPostToUpdate
      ).then(
        (response) => {
          console.log(response);
          commit("updatedBlogPostSuccess", response);
          return Promise.resolve(response);
        },
        (error) => {
          commit("updatedBlogPostFailure");
          return Promise.reject(error);
        }
      );
    },
    deleteBlogPost({ commit }, { userId, blogPostId }) {
      return BlogPostsService.deleteBlogPost(userId, blogPostId).then(
        async () => {
          const updatedBlogPosts =
            await BlogPostsService.getBlogPostsOfLoggedInUser(
              userId,
              blogPostId
            );

          commit("deletedBlogPostSuccess", updatedBlogPosts.data);
          return Promise.resolve(updatedBlogPosts);
        },
        (error) => {
          commit("deletedBlogPostFailure");
          return Promise.reject(error);
        }
      );
    },
  },
  mutations: {
    getBlogPostsSuccess(state, blogPosts) {
      state.blogPostsList = blogPosts.data;
      state.getBlogPostStatus = true;
    },
    getBlogPostsFailure(state) {
      state.getBlogPostStatus = false;
    },
    getBlogPostByIdSuccess(state, blogPost) {
      state.blogPost = blogPost.data;
      state.getBlogPostStatus = true;
    },
    getBlogPostByIdFailure(state) {
      state.getBlogPostStatus = false;
    },
    updatedBlogPostSuccess(state) {
      state.updatedBlogPostStatus = true;
    },
    updatedBlogPostFailure(state) {
      state.updatedBlogPostStatus = false;
    },
    deletedBlogPostSuccess(state, updatedBlogPosts) {
      state.blogPostsList = updatedBlogPosts;
      state.deleteBlogPostStatus = true;
    },
    deletedBlogPostFailure(state) {
      state.deleteBlogPostStatus = false;
    },
  },
  getters: {
    getBlogPosts: (state) => {
      return state.blogPostsList;
    },
    getBlogPost: (state) => {
      return state.blogPost;
    },
    getBlogPostUpdateStatus: (state) => {
      return state.updatedBlogPostStatus;
    },
  },
};
