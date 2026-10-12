import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import LoginPage from "./LoginPage.vue";
import * as authApi from "../api/authApi";
import { renderWithProviders } from "../../../test-utils";
import { getAccessToken } from "../../../helpers/apiHelper";

vi.mock("../api/authApi", () => ({ login: vi.fn(), register: vi.fn(), logout: vi.fn() }));

async function setup() {
  return renderWithProviders(LoginPage, { route: "/auth/login" });
}

describe("LoginPage", () => {
  it("menampilkan form login dan tautan registrasi", async () => {
    const { wrapper } = await setup();
    expect(wrapper.find("h2").text()).toBe("Masuk");
    expect(wrapper.find('a[href="/auth/register"]').exists()).toBe(true);
  });

  it("menampilkan pesan validasi ketika form kosong", async () => {
    const { wrapper } = await setup();
    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("Format email tidak valid");
    expect(wrapper.text()).toContain("Kata sandi wajib diisi");
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it("dapat menampilkan dan menyembunyikan kata sandi", async () => {
    const { wrapper } = await setup();
    const toggle = wrapper.find('[data-testid="toggle-password"]');
    expect(wrapper.find("#login-password-input").attributes("type")).toBe("password");
    await toggle.trigger("click");
    expect(wrapper.find("#login-password-input").attributes("type")).toBe("text");
    expect(toggle.attributes("aria-label")).toBe("Sembunyikan kata sandi");
    await toggle.trigger("click");
    expect(wrapper.find("#login-password-input").attributes("type")).toBe("password");
  });

  it("login berhasil menyimpan token dan menuju beranda", async () => {
    let resolveLogin;
    authApi.login.mockReturnValue(new Promise((resolve) => (resolveLogin = resolve)));
    const { wrapper, router } = await setup();

    await wrapper.find("#login-email-input").setValue(" budi@mail.com ");
    await wrapper.find("#login-password-input").setValue("rahasia");
    await wrapper.find("form").trigger("submit");

    expect(wrapper.find('button[type="submit"]').text()).toContain("Memproses...");
    expect(wrapper.find('button[type="submit"]').attributes("disabled")).toBeDefined();

    resolveLogin({ token: "tkn" });
    await flushPromises();

    expect(authApi.login).toHaveBeenCalledWith({ email: "budi@mail.com", password: "rahasia" });
    expect(getAccessToken()).toBe("tkn");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success" }));
    expect(router.currentRoute.value.name).toBe("home");
  });

  it("login gagal menampilkan dialog error", async () => {
    authApi.login.mockRejectedValue(new Error("Kredensial salah"));
    const { wrapper, router } = await setup();

    await wrapper.find("#login-email-input").setValue("budi@mail.com");
    await wrapper.find("#login-password-input").setValue("salah");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Kredensial salah" }));
    expect(router.currentRoute.value.name).toBe("login");
  });
});
