import UsersService from "@/services/users.service";

const initialState = {
  userData: {
    username: "",
    email: "",
  },
  getUserDataStatus: false,
};

export const usersModule = {
  namespaced: true,
  state: initialState,
  actions: {
    getUserDataById({ commit }, userId) {
      return UsersService.getUserDataEndpoint(userId).then(
        (response) => {
          commit("getUserSuccess", response);
          return Promise.resolve(response);
        },
        (error) => {
          commit("getUserFailure");
          return Promise.reject(error);
        }
      );
    },
  },
  mutations: {
    getUserSuccess(state, userData) {
      console.log(userData);
      state.userData = userData.data;
      state.getUserDataStatus = true;
    },
    getUserFailure(state) {
      state.getUserDataStatus = false;
    },
  },
  getters: {
    getUserData: (state) => {
      return state.userData.username;
    },
  },
};
