import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import ProfilePage from "./ProfilePage.vue";
import * as userApi from "../api/userApi";
import { useUsersStore } from "../states/usersStore";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../api/userApi", () => ({
  getMe: vi.fn(),
  putMe: vi.fn(),
  postMePhoto: vi.fn(),
  putMePassword: vi.fn(),
}));

const profile = { id: 1, name: "budi", email: "budi@mail.com", photo: null, created_at: "2026-01-01T00:00:00Z" };

async function setup(state = { profile }) {
  return renderWithProviders(ProfilePage, { route: "/profile", initialState: { users: state } });
}

async function selectPhoto(wrapper, file) {
  const input = wrapper.find('[data-testid="photo-input"]');
  Object.defineProperty(input.element, "files", { value: file ? [file] : [], configurable: true });
  await input.trigger("change");
  await flushPromises();
}

describe("ProfilePage", () => {
  it("menampilkan fallback ketika profil belum dimuat lalu mengisi form", async () => {
    const { wrapper, pinia } = await setup({ profile: null });
    expect(wrapper.text()).toContain("?");
    expect(wrapper.find("#profile-name").element.value).toBe("");

    useUsersStore(pinia).profile = { ...profile, photo: "https://img/me.png" };
    await flushPromises();
    expect(wrapper.find("#profile-name").element.value).toBe("budi");
    expect(wrapper.find('[data-testid="profile-photo"]').attributes("src")).toBe("https://img/me.png");
  });

  it("menampilkan inisial dan data profil", async () => {
    const { wrapper } = await setup();
    expect(wrapper.text()).toContain("B");
    expect(wrapper.find("#profile-email").element.value).toBe("budi@mail.com");
  });

  it("validasi dan simpan profil", async () => {
    userApi.putMe.mockResolvedValueOnce("Berhasil mengubah profil").mockResolvedValueOnce("").mockRejectedValueOnce(new Error("Email dipakai"));
    userApi.getMe.mockResolvedValue({ ...profile, name: "Budi Baru" });
    const { wrapper } = await setup();
    const form = wrapper.find('[data-testid="profile-form"]');

    await wrapper.find("#profile-name").setValue("a");
    await wrapper.find("#profile-email").setValue("salah");
    await form.trigger("submit");
    expect(wrapper.text()).toContain("Nama minimal 3 karakter");
    expect(wrapper.text()).toContain("Format email tidak valid");

    await wrapper.find("#profile-name").setValue("Budi Baru");
    await wrapper.find("#profile-email").setValue("budi@mail.com");
    await form.trigger("submit");
    await flushPromises();
    expect(userApi.putMe).toHaveBeenCalledWith({ name: "Budi Baru", email: "budi@mail.com" });
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: "Berhasil mengubah profil" }));

    await form.trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: "Profil berhasil diperbarui" }));

    await form.trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: "error", text: "Email dipakai" }));
  });

  it("mengganti foto profil", async () => {
    userApi.postMePhoto
      .mockResolvedValueOnce("Berhasil mengubah foto")
      .mockResolvedValueOnce("")
      .mockRejectedValueOnce(new Error("Format salah"));
    userApi.getMe.mockResolvedValue(profile);
    const { wrapper } = await setup();
    const clickSpy = vi.spyOn(wrapper.find('[data-testid="photo-input"]').element, "click");

    await wrapper.find('[data-testid="change-photo"]').trigger("click");
    expect(clickSpy).toHaveBeenCalled();

    await selectPhoto(wrapper, null);
    expect(userApi.postMePhoto).not.toHaveBeenCalled();

    await selectPhoto(wrapper, new File(["x"], "a.txt", { type: "text/plain" }));
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: "Berkas harus berupa gambar" }));

    const image = new File(["x"], "a.png", { type: "image/png" });
    await selectPhoto(wrapper, image);
    expect(userApi.postMePhoto).toHaveBeenCalledWith(image);
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: "Berhasil mengubah foto" }));

    await selectPhoto(wrapper, image);
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: "Foto profil berhasil diperbarui" }));

    await selectPhoto(wrapper, image);
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: "error", text: "Format salah" }));
  });

  it("validasi dan ganti kata sandi", async () => {
    userApi.putMePassword
      .mockResolvedValueOnce("Berhasil mengubah kata sandi")
      .mockResolvedValueOnce("")
      .mockRejectedValueOnce(new Error("Kata sandi lama salah"));
    const { wrapper } = await setup();
    const form = wrapper.find('[data-testid="password-form"]');

    await wrapper.find("#new-password").setValue("123");
    await wrapper.find("#new-password-confirmation").setValue("456");
    await form.trigger("submit");
    expect(wrapper.text()).toContain("Kata sandi lama wajib diisi");
    expect(wrapper.text()).toContain("Kata sandi baru minimal 8 karakter");
    expect(wrapper.text()).toContain("Konfirmasi kata sandi tidak sama");

    const fill = async () => {
      await wrapper.find("#current-password").setValue("lama1234");
      await wrapper.find("#new-password").setValue("baru12345");
      await wrapper.find("#new-password-confirmation").setValue("baru12345");
    };

    await fill();
    await form.trigger("submit");
    await flushPromises();
    expect(userApi.putMePassword).toHaveBeenCalledWith({
      password: "lama1234",
      newPassword: "baru12345",
      newPasswordConfirmation: "baru12345",
    });
    expect(wrapper.find("#current-password").element.value).toBe("");
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: "Berhasil mengubah kata sandi" }));

    await fill();
    await form.trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: "Kata sandi berhasil diubah" }));

    await fill();
    await form.trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: "error", text: "Kata sandi lama salah" }));
  });

  it("menampilkan indikator loading pada setiap aksi", async () => {
    const { wrapper } = await setup({
      profile,
      isPhotoChange: true,
      isProfileChange: true,
      isPasswordChange: true,
    });
    expect(wrapper.findAll(".animate-spin")).toHaveLength(3);
  });
});
