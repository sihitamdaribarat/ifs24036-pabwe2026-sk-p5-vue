import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import NavbarComponent from "./NavbarComponent.vue";
import SidebarComponent from "./SidebarComponent.vue";
import * as authApi from "../../auth/api/authApi";
import { useUsersStore } from "../../users/states/usersStore";
import { renderWithProviders } from "../../../test-utils";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";

vi.mock("../../auth/api/authApi", () => ({ login: vi.fn(), register: vi.fn(), logout: vi.fn() }));

const profile = { id: 1, name: "budi", email: "budi@mail.com", photo: null };

describe("NavbarComponent", () => {
  it("menampilkan status memuat ketika profil belum ada", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent);
    expect(wrapper.text()).toContain("Memuat...");
    expect(wrapper.find('[data-testid="navbar-profile"]').text()).toContain("?");
  });

  it("menampilkan inisial atau foto profil", async () => {
    const { wrapper, pinia } = await renderWithProviders(NavbarComponent, { initialState: { users: { profile } } });
    expect(wrapper.text()).toContain("B");
    expect(wrapper.text()).toContain("budi@mail.com");

    useUsersStore(pinia).profile = { ...profile, photo: "https://img/p.png" };
    await flushPromises();
    expect(wrapper.find('img[alt="Foto profil"]').attributes("src")).toBe("https://img/p.png");
  });

  it("emit toggle-sidebar ketika tombol menu ditekan", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent);
    await wrapper.find('[data-testid="toggle-sidebar"]').trigger("click");
    expect(wrapper.emitted("toggle-sidebar")).toHaveLength(1);
  });

  it("logout setelah konfirmasi", async () => {
    putAccessToken("tkn");
    authApi.logout.mockResolvedValue("OK");
    const { wrapper, router, pinia } = await renderWithProviders(NavbarComponent, {
      initialState: { users: { profile }, auth: { token: "tkn" } },
    });

    await wrapper.find('[data-testid="logout-button"]').trigger("click");
    await flushPromises();

    expect(authApi.logout).toHaveBeenCalled();
    expect(getAccessToken()).toBeNull();
    expect(useUsersStore(pinia).profile).toBeNull();
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe("login"));
  });

  it("batal logout ketika konfirmasi ditolak", async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    const { wrapper, router } = await renderWithProviders(NavbarComponent);
    await wrapper.find('[data-testid="logout-button"]').trigger("click");
    await flushPromises();
    expect(authApi.logout).not.toHaveBeenCalled();
    expect(router.currentRoute.value.name).toBe("home");
  });
});

describe("SidebarComponent", () => {
  it("menandai menu aktif sesuai rute", async () => {
    const { wrapper, router } = await renderWithProviders(SidebarComponent, { route: "/" });
    const links = () => wrapper.findAll("nav a");
    expect(links()).toHaveLength(4);
    expect(links()[0].classes()).toContain("bg-indigo-50");

    await router.push({ name: "home", query: { tab: "mine" } });
    expect(links()[1].classes()).toContain("bg-indigo-50");
    expect(links()[0].classes()).not.toContain("bg-indigo-50");

    await router.push("/users");
    expect(links()[2].classes()).toContain("bg-indigo-50");

    await router.push("/profile");
    expect(links()[3].classes()).toContain("bg-indigo-50");
  });

  it("drawer responsif: terbuka, backdrop, dan emit close", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: false } });
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="sidebar"]').classes()).toContain("-translate-x-full");

    await wrapper.setProps({ open: true });
    expect(wrapper.find('[data-testid="sidebar"]').classes()).toContain("translate-x-0");

    await wrapper.find('[data-testid="sidebar-backdrop"]').trigger("click");
    await wrapper.find('[data-testid="close-sidebar"]').trigger("click");
    await wrapper.findAll("nav a")[2].trigger("click");
    await wrapper.find("aside > div > a").trigger("click");
    await wrapper.find("aside > div:last-child a").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(5);
  });
});
