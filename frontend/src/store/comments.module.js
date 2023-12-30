import CommentsService from "@/services/comments.service";

const initialState = {
  commentsList: [],
  comment: {},
  commentAuthor: "",
  getCommentsStatus: false,
  commentAddedStatus: false,
};

export const commentsModule = {
  namespaced: true,
  state: initialState,
  actions: {
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
    addCommentToBlogPost(
      { commit },
      { loggedInUserId, userId, blogPostId, commentToAdd }
    ) {
      return CommentsService.addComment(userId, blogPostId, commentToAdd).then(
        async (response) => {
          const updatedBlogPosts = await CommentsService.getAllComments(
            loggedInUserId,
            blogPostId
          );

          console.log(updatedBlogPosts);

          commit("addCommentSuccess", updatedBlogPosts.data);
          return Promise.resolve(response);
        },
        (error) => {
          commit("addCommentFailure");
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
  },
};
