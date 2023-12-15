<template>
  <article class="register-page col-md-12">
    <header>
      <h2 class="fw-bolder mt-4 mb-5 fs-1 text-primary">Register a New User</h2>
    </header>

    <div
      class="d-flex justify-content-center align-items-center flex-column gap-4"
    >
      <div
        :class="!successful ? 'd-block' : 'd-none'"
        class="register-card border border-2 border-secondary rounded p-4"
      >
        <img
          id="profile-img"
          src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
          class="profile-img-card"
        />

        <Form @submit="handleRegister" :validation-schema="schema">
          <div v-if="!successful">
            <div>
              <label class="fw-bold fs-4">Email</label>
              <div class="d-flex flex-column m-auto mb-3">
                <Field
                  class="register-input fw-bold m-auto"
                  name="email"
                  type="text"
                  v-model="user.email"
                />
                <ErrorMessage
                  name="email"
                  class="text-danger fw-bold fs-6 error-feedback"
                />
              </div>
            </div>

            <div class="mb-5">
              <label class="fw-bold fs-4">Password</label>
              <div class="d-flex flex-column m-auto">
                <Field
                  class="register-input fw-bold m-auto"
                  name="password"
                  type="password"
                  v-model="user.password"
                />
                <ErrorMessage
                  name="password"
                  class="text-danger fw-bold fs-6 error-feedback"
                />
              </div>
            </div>

            <div class="d-flex justify-content-center flex-column gap-2">
              <button
                class="btn fw-bold"
                :class="loading ? 'btn-secondary' : 'btn-primary'"
                type="submit"
                :disabled="loading"
              >
                Register
              </button>

              <button
                class="btn fw-bold btn-outline-primary border border-3 border-primary"
                type="button"
                @click="navigateToLoginPage"
              >
                Already registered? Login!
              </button>
            </div>
          </div>
        </Form>
      </div>

      <div
        v-if="message"
        class="alert w-75 fw-bold fs-4"
        :class="successful ? 'alert-success' : 'alert-danger'"
      >
        {{ message }}
      </div>
    </div>
  </article>
</template>

<script>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { mapActions } from "vuex";

export default {
  name: "RegisterPage",
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  data() {
    const schema = yup.object().shape({
      email: yup
        .string()
        .required("Email is required!")
        .email("Email is invalid!")
        .max(50, "Must be maximum 50 characters!"),
      password: yup
        .string()
        .required("Password is required!")
        .min(6, "Must be at least 6 characters!")
        .max(40, "Must be maximum 40 characters!"),
    });

    return {
      user: {},
      successful: false,
      hideElement: false,
      loading: false,
      message: "",
      schema,
    };
  },
  methods: {
    // -> map the actions from the 'auth@ vuex module
    ...mapActions("auth", ["register"]),
    handleRegister: async function () {
      this.user = {
        email: this.user.email,
        password: this.user.password,
      };

      this.message = "";
      this.successful = false;
      this.loading = true;
      try {
        const response = await this.register(this.user);
        this.message = response.message;
        this.successful = true;
        this.loading = false;
        this.hideElement = true;
        this.user = {};
      } catch (error) {
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
    navigateToLoginPage: function () {
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
.register-page {
  height: 70vh;
}

.register-card {
  width: 20rem;
  margin: 0 auto;
}

.profile-img-card {
  width: 4rem;
  border-radius: 50%;
  margin: 1rem auto 2rem;
}

.register-input {
  width: 16rem;
  border-radius: 0.5rem;
  font-size: 1.3rem;
}
</style>
