<template>
  <div v-if="pageLoadingStatus === true">
    <loading-spinner />
  </div>

  <article class="login-page col-md-12" v-else>
    <header>
      <h2 class="fw-bolder mt-4 mb-5 fs-1 text-primary">
        Login into your Account
      </h2>
    </header>

    <div class="login-card border border-2 border-secondary rounded p-4">
      <img
        id="profile-img"
        src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
        class="profile-img-card" />

      <Form @submit="handleLogin" :validation-schema="schema">
        <div class="form-group mb-3">
          <label for="email" class="fw-bold fs-4">Email</label>
          <div>
            <Field
              name="email"
              type="text"
              class="form-control register-input fw-bold m-auto border border-2 border-dark"
              v-model="user.email" />
            <ErrorMessage name="email" class="text-danger fw-bold" />
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="password" class="fw-bold fs-4">Password</label>
          <Field
            name="password"
            type="password"
            class="form-control register-input fw-bold m-auto border border-2 border-dark"
            v-model="user.password" />
          <ErrorMessage
            name="password"
            class="text-danger error-feedback fw-bold" />
        </div>

        <div
          class="form-group d-flex justify-content-center align-items-center flex-column gap-2 mt-5">
          <button
            class="control-btn btn btn-primary fw-bold border border-3 border-primary w-100 m-auto"
            :disabled="loading">
            <span
              v-show="loading"
              class="spinner-border spinner-border-sm"></span>
            <span>Login</span>
          </button>

          <button
            class="control-btn btn btn-outline-primary fw-bold border border-3 border-primary w-100 m-auto"
            @click="navigateToRegisterPage">
            No Account? Register!
          </button>
        </div>

        <div class="form-group">
          <div v-if="message" class="alert alert-danger" role="alert">
            {{ message }}
          </div>
        </div>
      </Form>
    </div>
  </article>
</template>

<script>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { mapActions } from "vuex";
import LoadingSpinner from "@/components/LoadingSpinner";

export default {
  name: "RegisterPage",
  components: {
    Form,
    Field,
    ErrorMessage,
    LoadingSpinner,
  },
  data() {
    const schema = yup.object().shape({
      email: yup.string().required("Email is required!"),
      password: yup.string().required("Password is required!"),
    });

    return {
      pageLoadingStatus: true,
      loading: false,
      message: "",
      schema,
      user: {},
    };
  },
  created() {
    this.pageLoadingStatus = false;
  },
  methods: {
    ...mapActions("auth", ["login"]),
    handleLogin: async function () {
      this.user = {
        email: this.user.email,
        password: this.user.password,
      };

      this.loading = true;
      try {
        const response = await this.login(this.user);

        console.log(response);

        if (response.message === "Logged in successfully!")
          this.$router.push("/");
      } catch (error) {
        console.log(error);
        this.message =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        this.successful = false;
        this.loading = false;
      }
    },
    navigateToRegisterPage: function () {
      this.$router.push("/register");
    },
  },
};
</script>

<style scoped>
.login-page {
  height: 70vh;
}
.profile-img-card {
  width: 4rem;
  border-radius: 50%;
  margin: 1rem auto 2rem;
}
.login-card {
  width: 20rem;
  margin: 0 auto;
}

.login-input {
  width: 16rem;
  border-radius: 0.5rem;
  font-size: 1.3rem;
}

.control-btn {
  line-height: 1.5;
}
</style>
