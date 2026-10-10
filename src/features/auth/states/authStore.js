import { defineStore } from "pinia";
import * as authApi from "../api/authApi";
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "../../../helpers/apiHelper";
import { runAction } from "../../../helpers/storeHelper";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: getAccessToken(),
    isAuthLogin: false,
    isAuthRegister: false,
    isAuthRegistered: false,
    isAuthLogout: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    login(email, password) {
      return runAction(this, "isAuthLogin", null, async () => {
        const data = await authApi.login({ email, password });
        putAccessToken(data.token);
        this.token = data.token;
        return "Berhasil masuk";
      });
    },
    register(name, email, password) {
      return runAction(this, "isAuthRegister", "isAuthRegistered", () =>
        authApi.register({ name, email, password }),
      );
    },
    async logout() {
      this.isAuthLogout = true;
      try {
        await authApi.logout();
      } catch {
        // Token tetap dihapus walaupun request logout gagal.
      } finally {
        removeAccessToken();
        this.token = null;
        this.isAuthLogout = false;
      }
    },
  },
});
