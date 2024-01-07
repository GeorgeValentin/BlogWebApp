import AuthService from "@/services/auth.service";

// -> extragem informatiile din localStorage
const user = JSON.parse(localStorage.getItem("tokenResponse"));
const userEmail = localStorage.getItem("userEmail");

// -> cream state-ul initial
const initialState = user
  ? { status: { loggedIn: true }, user, userEmail }
  : { status: { loggedIn: false }, user: null, userEmail: null };

// -> cream modulul de auth
export const auth = {
  // -> namespaced -> utilizat pentru evitarea conflictelor numelor modulelor
  namespaced: true,
  state: initialState,

  // -> metodele care sunt chemate pentru modificarea state-ului
  actions: {
    // -> metoda de login, primeste obiectul user si
    // -> { commit }, acesta e utilizat pentru modificarea state-ului
    login({ commit }, user) {
      // -> cheama metoda login din AuthService
      return AuthService.login(user).then(
        (user) => {
          // -> raspunsul este transmis catre mutatia "loginSuccess"
          commit("loginSuccess", user);
          return Promise.resolve(user);
        },
        (error) => {
          commit("loginFailure");
          return Promise.reject(error);
        }
      );
    },
    logout({ commit }) {
      AuthService.logout();
      commit("logout");
    },
    register({ commit }, user) {
      return AuthService.register(user).then(
        (response) => {
          commit("registerSuccess");
          return Promise.resolve(response.data);
        },
        (error) => {
          commit("registerFailure");
          return Promise.reject(error);
        }
      );
    },
  },
  // -> mutatiile sunt folosite pentru a modifica state-ul aplicatiei
  mutations: {
    loginSuccess(state, user) {
      state.status.loggedIn = true;
      state.user = user;
      state.userEmail = user.loggedInUserEmail;
      state.username = user.username;
    },
    loginFailure(state) {
      state.status.loggedIn = false;
      state.user = null;
    },
    logout(state) {
      state.status.loggedIn = false;
      state.user = null;
      state.userEmail = null;
    },
    registerSuccess(state) {
      state.status.loggedIn = false;
    },
    registerFailure(state) {
      state.status.loggedIn = false;
    },
  },
  // -> getter-ele sunt folosite pentru a extrage parti din state-ul aplicatiei
  getters: {
    getLoggedInStatus: (state) => {
      return state.status.loggedIn;
    },
    getLoggedInUserEmail: (state) => {
      return state.userEmail;
    },
    getLoggedInUserData: (state) => {
      return state.user;
    },
  },
};
