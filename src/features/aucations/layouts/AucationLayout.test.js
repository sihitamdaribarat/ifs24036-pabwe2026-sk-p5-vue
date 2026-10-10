import { describe, expect, it, vi } from "vitest";
import { h } from "vue";
import AucationLayout from "./AucationLayout.vue";
import App from "../../../App.vue";
import * as userApi from "../../users/api/userApi";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../../users/api/userApi", () => ({ getMe: vi.fn() }));

describe("AucationLayout", () => {
  it("memuat profil, menampilkan navbar, sidebar, dan konten rute", async () => {
    userApi.getMe.mockResolvedValue({ id: 1, name: "Budi", email: "budi@mail.com" });
    const { wrapper } = await renderWithProviders(App, {
      routes: [
        {
          path: "/",
          component: AucationLayout,
          children: [{ path: "", name: "home", component: { render: () => h("p", { "data-testid": "content" }, "Konten") } }],
        },
        { path: "/users", name: "users", component: { render: () => null } },
        { path: "/profile", name: "profile", component: { render: () => null } },
      ],
    });

    expect(userApi.getMe).toHaveBeenCalled();
    expect(wrapper.text()).toContain("Budi");
    expect(wrapper.find('[data-testid="content"]').text()).toBe("Konten");

    const sidebar = () => wrapper.find('[data-testid="sidebar"]');
    expect(sidebar().classes()).toContain("-translate-x-full");

    await wrapper.find('[data-testid="toggle-sidebar"]').trigger("click");
    expect(sidebar().classes()).toContain("translate-x-0");

    await wrapper.find('[data-testid="close-sidebar"]').trigger("click");
    expect(sidebar().classes()).toContain("-translate-x-full");
  });
});
