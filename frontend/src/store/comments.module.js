import CommentsService from "@/services/comments.service";

const initialState = {
  commentsList: [],
  commentsListOfOthers: [],
  comment: {},
  commentAuthor: "",
  getCommentsStatus: false,
  commentAddedStatus: false,
  updatedCommentstatus: false,
  deleteCommentStatus: false,
};

export const commentsModule = {
  namespaced: true,
  state: initialState,
  actions: {
    // -> used when the logged in user wants to see what other people are commenting on posts (read-only)
    getCommentsOfBlogPostFromOthers({ commit }, { blogPostId }) {
      return CommentsService.getAllCommentsWithoutLoggedInData(blogPostId).then(
        (response) => {
          commit("getCommentsOfOthersSuccess", response);
          return Promise.resolve(response);
        },
        (error) => {
          commit("getCommentsOfOthersFailure");
          return Promise.reject(error);
        }
      );
    },
    // -> used for when the logged in user wants to modify the comments (edit/delete)
    getCommentsFromAllUsersOfBlogPost({ commit }, { blogPostId }) {
      return CommentsService.getAllCommentsOfAllUsersFromAPost(blogPostId).then(
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
    updateCommentOfBlogPost(
      { commit },
      { userId, blogPostId, commentId, commentToUpdate }
    ) {
      return CommentsService.editComment(
        userId,
        blogPostId,
        commentId,
        commentToUpdate
      ).then(
        (response) => {
          commit("updatedCommentSuccess", response);
          return Promise.resolve(response);
        },
        (error) => {
          commit("updatedCommentFailure");
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
    getCommentsOfOthersSuccess(state, comments) {
      state.commentsListOfOthers = comments.data;
      state.getCommentsStatus = true;
    },
    getCommentsOfOthersFailure(state) {
      state.getCommentsStatus = false;
    },
    addCommentSuccess(state, updatedComments) {
      state.commentsList = updatedComments;
      state.commentAddedStatus = true;
    },
    addCommentFailure(state) {
      state.commentAddedStatus = false;
    },
    updatedCommentSuccess(state) {
      state.updatedCommentstatus = true;
    },
    updatedCommentFailure(state) {
      state.updatedCommentstatus = false;
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
    getCommentsOfOtherUsers: (state) => {
      return state.commentsListOfOthers;
    },
    getComment: (state) => {
      return state.comment;
    },
    getAddCommentStatus: (state) => {
      return state.commentAddedStatus;
    },
    getUpdatedCommentStatus: (state) => {
      return state.updatedCommentstatus;
    },
    getDeletedCommentStatus: (state) => {
      return state.deleteCommentStatus;
    },
  },
};
