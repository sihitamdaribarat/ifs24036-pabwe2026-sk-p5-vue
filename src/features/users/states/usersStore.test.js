import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import * as userApi from "../api/userApi";
import { useUsersStore } from "./usersStore";

vi.mock("../api/userApi", () => ({
  getUsers: vi.fn(),
  getUserById: vi.fn(),
  getMe: vi.fn(),
  putMe: vi.fn(),
  postMePhoto: vi.fn(),
  putMePassword: vi.fn(),
}));

const me = { id: 1, name: "Budi", email: "budi@mail.com" };

describe("useUsersStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("getUsers mengisi daftar pengguna", async () => {
    userApi.getUsers.mockResolvedValue([me]);
    const store = useUsersStore();
    expect((await store.getUsers()).success).toBe(true);
    expect(store.users).toEqual([me]);
    expect(store.isUsers).toBe(false);
  });

  it("getUsers gagal", async () => {
    userApi.getUsers.mockRejectedValue(new Error("Gagal"));
    const store = useUsersStore();
    expect(await store.getUsers()).toEqual({ success: false, message: "Gagal" });
  });

  it("getUser dan getProfile", async () => {
    userApi.getUserById.mockResolvedValue({ id: 2 });
    userApi.getMe.mockResolvedValue(me);
    const store = useUsersStore();
    await store.getUser(2);
    await store.getProfile();
    expect(userApi.getUserById).toHaveBeenCalledWith(2);
    expect(store.user).toEqual({ id: 2 });
    expect(store.profile).toEqual(me);
  });

  it("changeProfile memperbarui profil lalu memuat ulang", async () => {
    userApi.putMe.mockResolvedValue("Profil diubah");
    userApi.getMe.mockResolvedValue({ ...me, name: "Baru" });
    const store = useUsersStore();
    const result = await store.changeProfile("Baru", me.email);
    expect(userApi.putMe).toHaveBeenCalledWith({ name: "Baru", email: me.email });
    expect(result.message).toBe("Profil diubah");
    expect(store.profile.name).toBe("Baru");
    expect(store.isProfileChanged).toBe(true);
  });

  it("changePhoto mengunggah foto lalu memuat ulang profil", async () => {
    userApi.postMePhoto.mockResolvedValue("Foto diubah");
    userApi.getMe.mockResolvedValue({ ...me, photo: "p.png" });
    const store = useUsersStore();
    const file = new File(["x"], "p.png");
    const result = await store.changePhoto(file);
    expect(userApi.postMePhoto).toHaveBeenCalledWith(file);
    expect(result.success).toBe(true);
    expect(store.profile.photo).toBe("p.png");
    expect(store.isPhotoChanged).toBe(true);
  });

  it("changePassword", async () => {
    userApi.putMePassword.mockResolvedValue("Sandi diubah");
    const store = useUsersStore();
    const result = await store.changePassword("old", "newpass1", "newpass1");
    expect(userApi.putMePassword).toHaveBeenCalledWith({
      password: "old",
      newPassword: "newpass1",
      newPasswordConfirmation: "newpass1",
    });
    expect(result.message).toBe("Sandi diubah");
    expect(store.isPasswordChanged).toBe(true);
  });

  it("clearProfile mengosongkan profil", () => {
    const store = useUsersStore();
    store.profile = me;
    store.clearProfile();
    expect(store.profile).toBeNull();
  });
});
