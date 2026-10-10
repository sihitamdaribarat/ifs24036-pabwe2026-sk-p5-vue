import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchApi } from "../../../helpers/apiHelper";
import authApi, { login, logout, register } from "./authApi";

vi.mock("../../../helpers/apiHelper", () => ({ fetchApi: vi.fn() }));

describe("authApi", () => {
  beforeEach(() => {
    fetchApi.mockResolvedValue({ status: "success", message: "OK", data: { token: "t", user: { id: 1 } } });
  });

  it("login mengirim email dan password lalu mengembalikan data", async () => {
    const data = await login({ email: "a@b.c", password: "secret" });
    expect(fetchApi).toHaveBeenCalledWith("/auth/login", { method: "POST", body: { email: "a@b.c", password: "secret" } });
    expect(data.token).toBe("t");
  });

  it("register mengirim data pengguna baru", async () => {
    const message = await register({ name: "A", email: "a@b.c", password: "secret" });
    expect(fetchApi).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: { name: "A", email: "a@b.c", password: "secret" },
    });
    expect(message).toBe("OK");
  });

  it("logout memanggil endpoint logout", async () => {
    expect(await logout()).toBe("OK");
    expect(fetchApi).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
  });

  it("menyediakan default export", () => {
    expect(authApi).toEqual({ login, register, logout });
  });
});
