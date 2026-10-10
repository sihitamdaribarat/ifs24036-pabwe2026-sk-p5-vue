import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";
import { routes as appRoutes } from "./router";

/**
 * Membuat instance Pinia baru (aktif) dengan state awal opsional.
 * @param {Record<string, object>} initialState contoh: { auth: { token: "abc" } }
 */
export function createMockPinia(initialState = {}) {
  const pinia = createPinia();
  pinia.use(({ store }) => {
    if (initialState[store.$id]) store.$patch(initialState[store.$id]);
  });
  setActivePinia(pinia);
  return pinia;
}

export function createTestRouter(routes = appRoutes) {
  return createRouter({ history: createMemoryHistory(), routes });
}

/**
 * Me-render komponen Vue yang terhubung dengan Pinia dan router memory.
 */
export async function renderWithProviders(component, options = {}) {
  const {
    props = {},
    slots = {},
    route = "/",
    routes,
    pinia = createMockPinia(options.initialState),
    router = createTestRouter(routes),
    stubs = {},
  } = options;

  await router.push(route);
  await router.isReady();

  const wrapper = mount(component, {
    props,
    slots,
    attachTo: document.body,
    global: { plugins: [pinia, router], stubs },
  });
  await flushPromises();

  return { wrapper, router, pinia };
}
