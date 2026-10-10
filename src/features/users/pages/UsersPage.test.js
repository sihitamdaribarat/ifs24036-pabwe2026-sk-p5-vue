import { describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import UsersPage from "./UsersPage.vue";
import * as userApi from "../api/userApi";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../api/userApi", () => ({ getUsers: vi.fn() }));

const users = [
  { id: 1, name: "budi", email: "budi@mail.com", photo: null, created_at: "2026-01-01T00:00:00Z" },
  { id: 2, name: "Siti", email: "siti@mail.com", photo: "https://img/siti.png", created_at: "2026-02-01T00:00:00Z" },
];

describe("UsersPage", () => {
  it("menampilkan daftar pengguna dengan avatar atau inisial", async () => {
    userApi.getUsers.mockResolvedValue(users);
    const { wrapper } = await renderWithProviders(UsersPage, { route: "/users" });
    const items = wrapper.findAll('[data-testid="user-item"]');
    expect(items).toHaveLength(2);
    expect(items[0].text()).toContain("B");
    expect(items[1].find("img").attributes("src")).toBe("https://img/siti.png");
    expect(wrapper.text()).toContain("2 pengguna terdaftar");
  });

  it("memfilter pengguna dengan pencarian", async () => {
    userApi.getUsers.mockResolvedValue(users);
    const { wrapper } = await renderWithProviders(UsersPage, { route: "/users" });
    await wrapper.find('[data-testid="users-search"]').setValue("SITI");
    expect(wrapper.findAll('[data-testid="user-item"]')).toHaveLength(1);
    await wrapper.find('[data-testid="users-search"]').setValue("zzz");
    expect(wrapper.find('[data-testid="users-empty"]').exists()).toBe(true);
  });

  it("menampilkan loading dan dialog error", async () => {
    userApi.getUsers.mockReturnValueOnce(new Promise(() => {}));
    const loading = await renderWithProviders(UsersPage, { route: "/users" });
    expect(loading.wrapper.find(".animate-spin").exists()).toBe(true);

    userApi.getUsers.mockRejectedValueOnce(new Error("Gagal memuat"));
    await renderWithProviders(UsersPage, { route: "/users" });
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal memuat" }));
  });
});
