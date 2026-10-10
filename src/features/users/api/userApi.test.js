import { describe, expect, it, vi } from "vitest";
import { fetchApi } from "../../../helpers/apiHelper";
import userApi, { getMe, getUserById, getUsers, postMePhoto, putMe, putMePassword } from "./userApi";

vi.mock("../../../helpers/apiHelper", () => ({ fetchApi: vi.fn() }));

describe("userApi", () => {
  it("getUsers mengembalikan daftar pengguna", async () => {
    fetchApi.mockResolvedValue({ data: { users: [{ id: 1 }] } });
    expect(await getUsers()).toEqual([{ id: 1 }]);
    expect(fetchApi).toHaveBeenCalledWith("/users");
  });

  it("getUserById dan getMe mengembalikan satu pengguna", async () => {
    fetchApi.mockResolvedValue({ data: { user: { id: 2 } } });
    expect(await getUserById(2)).toEqual({ id: 2 });
    expect(fetchApi).toHaveBeenCalledWith("/users/2");
    expect(await getMe()).toEqual({ id: 2 });
    expect(fetchApi).toHaveBeenCalledWith("/users/me");
  });

  it("putMe memperbarui profil", async () => {
    fetchApi.mockResolvedValue({ message: "Diubah" });
    expect(await putMe({ name: "A", email: "a@b.c" })).toBe("Diubah");
    expect(fetchApi).toHaveBeenCalledWith("/users/me", { method: "PUT", body: { name: "A", email: "a@b.c" } });
  });

  it("postMePhoto mengunggah foto sebagai FormData", async () => {
    fetchApi.mockResolvedValue({ message: "Foto" });
    const file = new File(["x"], "a.png", { type: "image/png" });
    expect(await postMePhoto(file)).toBe("Foto");
    const [path, options] = fetchApi.mock.calls[0];
    expect(path).toBe("/users/me/photo");
    expect(options.method).toBe("POST");
    expect(options.body.get("photo")).toBeInstanceOf(File);
  });

  it("putMePassword mengirim field kata sandi", async () => {
    fetchApi.mockResolvedValue({ message: "Sandi" });
    expect(await putMePassword({ password: "a", newPassword: "b", newPasswordConfirmation: "b" })).toBe("Sandi");
    expect(fetchApi).toHaveBeenCalledWith("/users/me/password", {
      method: "PUT",
      body: { password: "a", new_password: "b", new_password_confirmation: "b" },
    });
  });

  it("menyediakan default export", () => {
    expect(Object.keys(userApi)).toEqual(["getUsers", "getUserById", "getMe", "putMe", "postMePhoto", "putMePassword"]);
  });
});
