import { describe, expect, it, vi } from "vitest";
import { createMemoryHistory } from "vue-router";
import router, { authGuard, createAppRouter, routes } from "./router";
import { putAccessToken } from "./helpers/apiHelper";

const protectedRoute = { matched: [{ meta: { requiresAuth: true } }] };
const guestRoute = { matched: [{ meta: { guestOnly: true } }] };
const publicRoute = { matched: [{ meta: {} }] };

describe("router", () => {
  it("mendeklarasikan rute auth, lelang, dan wildcard", () => {
    expect(routes.map((route) => route.path)).toEqual(["/auth", "/", "/:pathMatch(.*)*"]);
    expect(routes[0].children.map((route) => route.path)).toEqual(["", "login", "register"]);
    expect(routes[1].children.map((route) => route.path)).toEqual(["", "aucations/:aucationId", "users", "profile"]);
  });

  it("authGuard mengarahkan tamu ke login untuk rute terproteksi", () => {
    expect(authGuard(protectedRoute)).toEqual({ name: "login" });
    expect(authGuard(guestRoute)).toBe(true);
    expect(authGuard(publicRoute)).toBe(true);
  });

  it("authGuard mengarahkan pengguna login menjauhi halaman auth", () => {
    putAccessToken("token");
    expect(authGuard(guestRoute)).toEqual({ name: "home" });
    expect(authGuard(protectedRoute)).toBe(true);
  });

  it("createAppRouter memasang guard pada navigasi", async () => {
    const appRouter = createAppRouter(createMemoryHistory());
    await appRouter.push("/profile");
    expect(appRouter.currentRoute.value.fullPath).toBe("/auth/login");

    await appRouter.push("/auth");
    expect(appRouter.currentRoute.value.fullPath).toBe("/auth/login");

    await appRouter.push("/tidak-ada");
    expect(appRouter.currentRoute.value.name).toBe("not-found");
  });

  it("menyediakan router default berbasis web history", () => {
    expect(router.options.history).toBeDefined();
    expect(vi.isMockFunction(router.push)).toBe(false);
  });
});
