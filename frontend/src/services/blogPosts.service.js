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

  // async getBlogPostById(loggedInUserId, blogPostId) {
  //   return await axios.get(
  //     `${API_URL}/users/${String(loggedInUserId)}/blogPosts/${blogPostId}`
  //   );
  // }
}

export default new BlogPostsService();
