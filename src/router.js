import { createRouter, createWebHistory } from "vue-router";
import { getAccessToken } from "./helpers/apiHelper";

// Alur utama (login -> beranda) dimuat langsung agar redirect setelah login instan.
import AuthLayout from "./features/auth/layouts/AuthLayout.vue";
import LoginPage from "./features/auth/pages/LoginPage.vue";
import AucationLayout from "./features/aucations/layouts/AucationLayout.vue";
import HomePage from "./features/aucations/pages/HomePage.vue";

// Halaman sekunder dimuat secara lazy agar bundle awal tetap kecil.
const RegisterPage = () => import("./features/auth/pages/RegisterPage.vue");
const DetailPage = () => import("./features/aucations/pages/DetailPage.vue");
const UsersPage = () => import("./features/users/pages/UsersPage.vue");
const ProfilePage = () => import("./features/users/pages/ProfilePage.vue");
const NotFoundPage = () => import("./features/common/pages/NotFoundPage.vue");

export const routes = [
  {
    path: "/auth",
    component: AuthLayout,
    meta: { guestOnly: true },
    children: [
      { path: "", redirect: "/auth/login" },
      { path: "login", name: "login", component: LoginPage },
      { path: "register", name: "register", component: RegisterPage },
    ],
  },
  {
    path: "/",
    component: AucationLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", name: "home", component: HomePage },
      { path: "aucations/:aucationId", name: "detail", component: DetailPage },
      { path: "users", name: "users", component: UsersPage },
      { path: "profile", name: "profile", component: ProfilePage },
    ],
  },
  { path: "/:pathMatch(.*)*", name: "not-found", component: NotFoundPage },
];

export function authGuard(to) {
  const isLogin = Boolean(getAccessToken());
  if (to.matched.some((record) => record.meta.requiresAuth) && !isLogin) {
    return { name: "login" };
  }
  if (to.matched.some((record) => record.meta.guestOnly) && isLogin) {
    return { name: "home" };
  }
  return true;
}

export function createAppRouter(history = createWebHistory()) {
  const router = createRouter({ history, routes });
  router.beforeEach(authGuard);
  return router;
}

export default createAppRouter();
