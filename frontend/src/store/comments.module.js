import CommentsService from "@/services/comments.service";

const initialState = {
  commentsList: [],
  comment: {},
  commentAuthor: "",
  getCommentsStatus: false,
  commentAddedStatus: false,
  deleteCommentStatus: false,
};

export const commentsModule = {
  namespaced: true,
  state: initialState,
  actions: {
    // -> used for when the logged in user wants to modify the comments (edit/delete)
    getCommentsOfBlogPost({ commit }, { userId, blogPostId }) {
      return CommentsService.getAllComments(userId, blogPostId).then(
        (response) => {
          commit("getCommentsSuccess", response);
          return Promise.resolve(response);
        },
        (error) => {
          commit("getCommentsFailure");
          return Promise.reject(error);
        }
      );
    },
    // -> used when the logged in user wants to see what other people are commenting on posts (read-only)
    getCommentsFromAllUsersOfBlogPost({ commit }, { blogPostId }) {
      console.log(blogPostId);
      return CommentsService.getAllCommentsOfAllUsersFromAPost(blogPostId).then(
        (response) => {
          console.log(response);
          commit("getCommentsSuccess", response);
          return Promise.resolve(response);
        },
        (error) => {
          commit("getCommentsFailure");
          return Promise.reject(error);
        }
      );
    },
    addCommentToBlogPost({ commit }, { userId, blogPostId, commentToAdd }) {
      return CommentsService.addComment(userId, blogPostId, commentToAdd).then(
        async (response) => {
          const updatedBlogPosts =
            await CommentsService.getAllCommentsOfAllUsersFromAPost(blogPostId);

          commit("addCommentSuccess", updatedBlogPosts.data);
          return Promise.resolve(response);
        },
        (error) => {
          commit("addCommentFailure");
          return Promise.reject(error);
        }
      );
    },
    deleteCommentOfBlogPost({ commit }, { userId, blogPostId, commentId }) {
      return CommentsService.deleteComment(userId, blogPostId, commentId).then(
        async () => {
          const updatedComments =
            await CommentsService.getAllCommentsOfAllUsersFromAPost(blogPostId);

          commit("deletedCommentSuccess", updatedComments.data);
          return Promise.resolve(updatedComments);
        },
        (error) => {
          commit("deletedCommentFailure");
          return Promise.reject(error);
        }
      );
    },
  },
  mutations: {
    getCommentsSuccess(state, comments) {
      state.commentsList = comments.data;
      state.getCommentsStatus = true;
    },
    getCommentsFailure(state) {
      state.getCommentsStatus = false;
    },
    addCommentSuccess(state, updatedComments) {
      state.commentsList = updatedComments;
      state.commentAddedStatus = true;
    },
    addCommentFailure(state) {
      state.commentAddedStatus = false;
    },
    deletedCommentSuccess(state, updatedComments) {
      state.commentsList = updatedComments;
      state.deleteCommentStatus = true;
    },
    deletedCommentFailure(state) {
      state.deleteCommentStatus = false;
    },
  },
  getters: {
    getComments: (state) => {
      return state.commentsList;
    },
    getComment: (state) => {
      return state.comment;
    },
    getAddCommentStatus: (state) => {
      return state.commentAddedStatus;
    },
    getDeletedCommentStatus: (state) => {
      return state.deleteCommentStatus;
    },
  },
};
