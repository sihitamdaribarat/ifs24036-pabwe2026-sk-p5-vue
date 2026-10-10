import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import RegisterPage from "./RegisterPage.vue";
import * as authApi from "../api/authApi";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../api/authApi", () => ({ login: vi.fn(), register: vi.fn(), logout: vi.fn() }));

async function setup() {
  return renderWithProviders(RegisterPage, { route: "/auth/register" });
}

async function fillForm(wrapper, values = {}) {
  const data = { name: "Budi", email: "budi@mail.com", password: "rahasia123", passwordConfirmation: "rahasia123", ...values };
  for (const [id, value] of Object.entries(data)) {
    await wrapper.find(`#${id}`).setValue(value);
  }
}

describe("RegisterPage", () => {
  it("menampilkan semua pesan validasi", async () => {
    const { wrapper } = await setup();
    await fillForm(wrapper, { name: "a", email: "x", password: "123", passwordConfirmation: "456" });
    await wrapper.find("form").trigger("submit");

    expect(wrapper.text()).toContain("Nama minimal 3 karakter");
    expect(wrapper.text()).toContain("Format email tidak valid");
    expect(wrapper.text()).toContain("Kata sandi minimal 8 karakter");
    expect(wrapper.text()).toContain("Konfirmasi kata sandi tidak sama");
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it("registrasi berhasil menuju halaman login", async () => {
    let resolveRegister;
    authApi.register.mockReturnValue(new Promise((resolve) => (resolveRegister = resolve)));
    const { wrapper, router } = await setup();

    await fillForm(wrapper);
    await wrapper.find("form").trigger("submit");
    expect(wrapper.find('button[type="submit"]').text()).toContain("Memproses...");

    resolveRegister("Berhasil mendaftar");
    await flushPromises();

    expect(authApi.register).toHaveBeenCalledWith({ name: "Budi", email: "budi@mail.com", password: "rahasia123" });
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Berhasil mendaftar" }));
    expect(router.currentRoute.value.name).toBe("login");
  });

  it("menggunakan pesan default ketika API tidak mengirim pesan", async () => {
    authApi.register.mockResolvedValue("");
    const { wrapper } = await setup();
    await fillForm(wrapper);
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Akun berhasil dibuat, silakan masuk." }));
  });

  it("registrasi gagal menampilkan dialog error", async () => {
    authApi.register.mockRejectedValue(new Error("Email sudah digunakan"));
    const { wrapper, router } = await setup();
    await fillForm(wrapper);
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Email sudah digunakan" }));
    expect(router.currentRoute.value.name).toBe("register");
  });
});
