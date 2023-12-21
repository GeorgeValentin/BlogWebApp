import { createRouter, createWebHashHistory } from "vue-router";
import HomePage from "../views/HomePage";
import NotFoundPage from "../views/NotFoundPage";
import RegisterPage from "../views/RegisterPage";
import LoginPage from "../views/LoginPage";
import BlogPostPage from "../views/BlogPostPage";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage,
  },
  {
    path: "/register",
    name: "register",
    component: RegisterPage,
  },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
  },
  {
    path: "/blogPostPage/:blogPostId",
    name: "blogPostPage",
    component: BlogPostPage,
  },
  // this will match any route path that is not specified above
  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: NotFoundPage,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
