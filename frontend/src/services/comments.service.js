import axios from "axios";
import authHeader from "./auth.header";

const API_URL = "api";

// -> serviciu care cheama partea de comments a API-ului
class CommentsService {
  async getAllCommentsWithoutLoggedInData(blogPostId) {
    return await axios.get(
      `${API_URL}/blogPostsWithoutLoggedIn/${blogPostId}/comments`,
      { headers: authHeader() }
    );
  }

  async getAllCommentsOfAllUsersFromAPost(blogPostId) {
    return await axios.get(`${API_URL}/blogPosts/${blogPostId}/comments`);
  }

  async addComment(userId, blogPostId, commentToAdd) {
    return await axios.post(
      `${API_URL}/users/${String(userId)}/blogPosts/${blogPostId}/comments`,
      commentToAdd,
      { headers: authHeader() }
    );
  }

  async editComment(userId, blogPostId, commentId, commentToUpdate) {
    return await axios.put(
      `${API_URL}/users/${String(
        userId
      )}/blogPosts/${blogPostId}/comments/${commentId}`,
      commentToUpdate,
      { headers: authHeader() }
    );
  }

  async deleteComment(userId, blogPostId, commentId) {
    return await axios.delete(
      `${API_URL}/users/${String(
        userId
      )}/blogPosts/${blogPostId}/comments/${commentId}`,
      { headers: authHeader() }
    );
  }
}

export default new CommentsService();
