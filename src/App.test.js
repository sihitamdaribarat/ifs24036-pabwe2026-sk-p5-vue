import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createMemoryHistory } from "vue-router";
import Swal from "sweetalert2";
import App from "./App.vue";
import { createAppRouter } from "./router";
import { createMockPinia } from "./test-utils";
import { getAccessToken, putAccessToken } from "./helpers/apiHelper";

function jsonResponse(body) {
  return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
}

const profile = { id: 1, name: "Budi Santoso", email: "budi@mail.com", photo: null, created_at: "2026-01-01T00:00:00Z" };
const aucations = [
  {
    id: 10,
    user_id: 2,
    title: "Kamera Analog",
    description: "Kamera klasik",
    cover: null,
    start_bid: 500000,
    closed_at: "2999-01-01 00:00:00",
    author: { name: "Siti", photo: null },
    bids: [],
  },
];

function mockApi() {
  globalThis.fetch = vi.fn((url, init = {}) => {
    const { pathname } = new URL(url);
    const method = init.method ?? "GET";
    if (pathname.endsWith("/auth/login")) {
      return jsonResponse({ status: "success", message: "OK", data: { token: "token-app", user: profile } });
    }
    if (pathname.endsWith("/auth/logout")) return jsonResponse({ status: "success", message: "Logout" });
    if (pathname.endsWith("/users/me")) return jsonResponse({ status: "success", data: { user: profile } });
    if (pathname.endsWith("/aucations") && method === "GET") {
      return jsonResponse({ status: "success", data: { aucations } });
    }
    return jsonResponse({ status: "fail", message: "Tidak ditangani" });
  });
}

async function mountApp(path) {
  const router = createAppRouter(createMemoryHistory());
  const pinia = createMockPinia();
  router.push(path);
  await router.isReady();
  const wrapper = mount(App, { global: { plugins: [pinia, router] }, attachTo: document.body });
  await flushPromises();
  return { wrapper, router };
}

describe("App (integrasi)", () => {
  it("mengarahkan pengguna yang belum login ke halaman login", async () => {
    mockApi();
    const { wrapper, router } = await mountApp("/");
    expect(router.currentRoute.value.name).toBe("login");
    expect(wrapper.find("h1").text()).toBe("Masuk");
  });

  it("alur login → dashboard → logout", async () => {
    mockApi();
    const { wrapper, router } = await mountApp("/auth/login");

    await wrapper.find("#login-email-input").setValue("budi@mail.com");
    await wrapper.find("#login-password-input").setValue("rahasia");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(getAccessToken()).toBe("token-app");
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe("home"));
    await vi.waitFor(() => expect(wrapper.text()).toContain("Kamera Analog"));
    expect(wrapper.text()).toContain("Dashboard Lelang");
    expect(wrapper.text()).toContain("Budi Santoso");

    await wrapper.find('[data-testid="logout-button"]').trigger("click");
    await flushPromises();

    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "warning" }));
    expect(getAccessToken()).toBeNull();
    expect(router.currentRoute.value.name).toBe("login");
  });

  it("menampilkan halaman 404 untuk rute yang tidak dikenal", async () => {
    putAccessToken("token");
    mockApi();
    const { wrapper } = await mountApp("/halaman/acak");
    expect(wrapper.text()).toContain("404");
    expect(wrapper.text()).toContain("Halaman tidak ditemukan");
  });
});
