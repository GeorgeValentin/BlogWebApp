import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";

import "bootstrap";
import "bootstrap/dist/css/bootstrap.css";

import { library } from "@fortawesome/fontawesome-svg-core";

import {
  faPlus,
  faMinus,
  faTrash,
  faCheck,
  faUserPlus,
  faLockOpen,
  faPen,
  faBook,
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faPlus,
  faMinus,
  faTrash,
  faCheck,
  faUserPlus,
  faLockOpen,
  faPen,
  faBook
);

axios.defaults.baseURL = "http://localhost:8000";

createApp(App).use(router).use(store).mount("#app");
