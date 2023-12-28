import axios from "axios";
// import authHeader from "./authHeader";

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
    return await axios
      .get(`${API_URL}/users/${String(loggedInUserId)}/blogPosts/${blogPostId}`)
      .then((response) => {
        // localStorage.setItem("currentBlogPost", JSON.stringify(response.data));
        return response;
      });
  }
}

export default new BlogPostsService();
