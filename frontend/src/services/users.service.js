import axios from "axios";
// import authHeader from "./authHeader";

const API_URL = "api";

class UsersService {
  async getUserDataEndpoint(userId) {
    return await axios.get(`${API_URL}/users/${userId}`);
  }
}

export default new UsersService();
