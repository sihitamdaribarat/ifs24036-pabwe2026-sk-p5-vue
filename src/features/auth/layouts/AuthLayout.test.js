import { describe, expect, it } from "vitest";
import AuthLayout from "./AuthLayout.vue";
import App from "../../../App.vue";
import { renderWithProviders } from "../../../test-utils";

describe("AuthLayout", () => {
  it("menampilkan banner dan halaman anak melalui RouterView", async () => {
    const { wrapper } = await renderWithProviders(App, {
      route: "/auth/login",
      routes: [
        {
          path: "/auth",
          component: AuthLayout,
          children: [{ path: "login", component: { template: "<p data-testid='child'>Form Login</p>" } }],
        },
      ],
    });

    expect(wrapper.find('[data-testid="auth-banner"]').text()).toContain("Lelang barang favoritmu");
    expect(wrapper.findAll("li")).toHaveLength(3);
    expect(wrapper.find('[data-testid="child"]').text()).toBe("Form Login");
  });
});
