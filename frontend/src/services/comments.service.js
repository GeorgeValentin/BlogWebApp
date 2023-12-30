import axios from "axios";
import authHeader from "./auth.header";

const API_URL = "api";

class CommentsService {
  async getAllComments(userId, blogPostId) {
    return await axios.get(
      `${API_URL}/users/${String(userId)}/blogPosts/${blogPostId}/comments`,
      { headers: authHeader() }
    );
  }

  async addComment(userId, blogPostId, commentToAdd) {
    return await axios.post(
      `${API_URL}/users/${String(userId)}/blogPosts/${blogPostId}/comments`,
      commentToAdd,
      { headers: authHeader() }
    );
  }
}

export default new CommentsService();
