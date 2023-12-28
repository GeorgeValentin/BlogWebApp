import axios from "axios";
import authHeader from "./auth.header";

const API_URL = "api";

class BlogPostsService {
  async getAllBlogPostsEndpoint() {
    return await axios.get(`${API_URL}/allBlogPosts`);
  }

  async getBlogPostsOfLoggedInUser(loggedInUserId) {
    return await axios.get(
      `${API_URL}/users/${String(loggedInUserId)}/blogPosts`
    );
  }

  async getBlogPostsOfOthers(loggedInUserId) {
    return await axios.get(
      `${API_URL}/users/${String(loggedInUserId)}/blogPostsOfOthers`
    );
  }

  async getBlogPostById(loggedInUserId, blogPostId) {
    return await axios.get(
      `${API_URL}/users/${String(loggedInUserId)}/blogPosts/${blogPostId}`
    );
  }

  async deleteBlogPost(loggedInUserId, blogPostId) {
    return await axios.delete(
      `${API_URL}/users/${String(loggedInUserId)}/blogPosts/${blogPostId}`,
      { headers: authHeader() }
    );
  }
}

export default new BlogPostsService();
