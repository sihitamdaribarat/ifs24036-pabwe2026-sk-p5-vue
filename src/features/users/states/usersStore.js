import { defineStore } from "pinia";
import * as userApi from "../api/userApi";
import { runAction } from "../../../helpers/storeHelper";

export const useUsersStore = defineStore("users", {
  state: () => ({
    users: [],
    user: null,
    profile: null,
    isUsers: false,
    isUser: false,
    isProfile: false,
    isProfileChange: false,
    isProfileChanged: false,
    isPhotoChange: false,
    isPhotoChanged: false,
    isPasswordChange: false,
    isPasswordChanged: false,
  }),
  actions: {
    getUsers() {
      return runAction(this, "isUsers", null, async () => {
        this.users = await userApi.getUsers();
        return "";
      });
    },
    getUser(id) {
      return runAction(this, "isUser", null, async () => {
        this.user = await userApi.getUserById(id);
        return "";
      });
    },
    getProfile() {
      return runAction(this, "isProfile", null, async () => {
        this.profile = await userApi.getMe();
        return "";
      });
    },
    changeProfile(name, email) {
      return runAction(this, "isProfileChange", "isProfileChanged", async () => {
        const message = await userApi.putMe({ name, email });
        this.profile = await userApi.getMe();
        return message;
      });
    },
    changePhoto(photo) {
      return runAction(this, "isPhotoChange", "isPhotoChanged", async () => {
        const message = await userApi.postMePhoto(photo);
        this.profile = await userApi.getMe();
        return message;
      });
    },
    changePassword(password, newPassword, newPasswordConfirmation) {
      return runAction(this, "isPasswordChange", "isPasswordChanged", () =>
        userApi.putMePassword({ password, newPassword, newPasswordConfirmation }),
      );
    },
    clearProfile() {
      this.profile = null;
    },
  },
});
