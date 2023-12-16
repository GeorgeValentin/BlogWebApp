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
  // -> good for avoiding naming conflicts
  namespaced: true,
  state: initialState,
  actions: {
    getBlogPostsOfLoggedInUser({ commit }, userId) {
      return BlogPostsService.getBlogPostsOfLoggedInUser(userId).then(
        (response) => {
          commit("getBlogPostsOfLoggedInUserSuccess", response);
          return Promise.resolve(response);
        },
        (error) => {
          commit("getBlogPostsOfLoggedInUserFailure");
          return Promise.reject(error);
        }
      );
    },
  },
  mutations: {
    getBlogPostsOfLoggedInUserSuccess(state, blogPosts) {
      state.blogPostsList = blogPosts.data;
      state.getBlogPostStatus = true;
    },
    getBlogPostsOfLoggedInUserFailure(state) {
      state.getBlogPostStatus = false;
    },
  },
  getters: {
    getBlogPosts: (state) => {
      return state.blogPostsList;
    },
  },
};

/*
author
blogPostId
category
name
comments
content
creationDate
likes
title
 */
