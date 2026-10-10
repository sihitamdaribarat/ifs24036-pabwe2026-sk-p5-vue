import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import * as authApi from "../api/authApi";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { useAuthStore } from "./authStore";

vi.mock("../api/authApi", () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

describe("useAuthStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("membaca token awal dari localStorage", () => {
    putAccessToken("saved");
    const store = useAuthStore();
    expect(store.token).toBe("saved");
    expect(store.isAuthenticated).toBe(true);
  });

  it("login berhasil menyimpan token", async () => {
    authApi.login.mockResolvedValue({ token: "new-token" });
    const store = useAuthStore();
    const result = await store.login("a@b.c", "secret");

    expect(authApi.login).toHaveBeenCalledWith({ email: "a@b.c", password: "secret" });
    expect(result).toEqual({ success: true, message: "Berhasil masuk" });
    expect(store.token).toBe("new-token");
    expect(getAccessToken()).toBe("new-token");
    expect(store.isAuthLogin).toBe(false);
  });

  it("login gagal mengembalikan pesan error", async () => {
    authApi.login.mockRejectedValue(new Error("Email atau kata sandi salah"));
    const store = useAuthStore();
    const result = await store.login("a@b.c", "x");
    expect(result).toEqual({ success: false, message: "Email atau kata sandi salah" });
    expect(store.isAuthenticated).toBe(false);
  });

  it("register mengatur status registrasi", async () => {
    authApi.register.mockResolvedValue("Berhasil mendaftar");
    const store = useAuthStore();
    const result = await store.register("A", "a@b.c", "secret12");
    expect(authApi.register).toHaveBeenCalledWith({ name: "A", email: "a@b.c", password: "secret12" });
    expect(result).toEqual({ success: true, message: "Berhasil mendaftar" });
    expect(store.isAuthRegistered).toBe(true);
  });

  it("logout menghapus token walaupun request gagal", async () => {
    putAccessToken("abc");
    const store = useAuthStore();

    authApi.logout.mockResolvedValue("OK");
    await store.logout();
    expect(store.token).toBeNull();
    expect(getAccessToken()).toBeNull();

    putAccessToken("abc");
    store.token = "abc";
    authApi.logout.mockRejectedValue(new Error("network"));
    await store.logout();
    expect(store.token).toBeNull();
    expect(getAccessToken()).toBeNull();
    expect(store.isAuthLogout).toBe(false);
  });
});
