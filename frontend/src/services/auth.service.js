import axios from "axios";

const API_URL = "authentication/";

// -> serviciu care cheama partea de authentication a API-ului
class AuthService {
  // -> metoda de login
  async login(user) {
    return await axios
      .post(API_URL + "login", {
        email: user.email,
        password: user.password,
      })
      .then((response) => {
        // -> raspunsul primit de la API va fi adaugat in localStorage si returnat
        if (response.data.token) {
          localStorage.setItem("tokenResponse", JSON.stringify(response.data));
          localStorage.setItem("userEmail", user.email);
          localStorage.setItem("isAuth", true);
        }
        response.data.loggedInUserEmail = user.email;

        return response.data;
      });
  }

  // -> metoda de logout (goleste localStorage)
  logout() {
    localStorage.removeItem("isAuth");
    localStorage.removeItem("tokenResponse");
    localStorage.removeItem("userEmail");
  }

  // -> metoda de register
  async register(user) {
    return await axios
      .post(API_URL + "register", {
        email: user.email,
        password: user.password,
        username: user.username,
      })
      .then((response) => {
        console.log(response);

        // -> returneaza raspunsul primit de la API
        return response;
      });
  }
}

export default new AuthService();
