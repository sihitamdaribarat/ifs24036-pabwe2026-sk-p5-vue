# ifs24036-pabwe2026-sk-p5-vue — Delcom Auction

Aplikasi lelang (auction) berbasis **Vue 3 + JavaScript** yang dijalankan dengan **bun**, memakai data dari
[Delcom Open API — Aucations](https://open-api.delcom.org/docs/1.0/api-aucations).

**Stack:** Vue 3 · Vite · Pinia · Vue Router · Tailwind CSS v4 · lucide-vue-next · SweetAlert2 · @toast-ui/editor ·
Plus Jakarta Sans (Google Fonts) · Vitest + jsdom + @testing-library/jest-dom.

## Menjalankan

```bash
cp .env.example .env   # atur VITE_DELCOM_BASEURL dan APP_PORT
bun install
bun run dev            # http://localhost:${APP_PORT}
bun run build          # build produksi ke dist/
```

## Pengujian

```bash
bun run test           # menjalankan semua test
bun run test:coverage  # coverage v8 dengan threshold 100%
```

## Struktur

```
src/
├── helpers/            apiHelper (fetch + token), toolsHelper (SweetAlert2, formatRupiah, formatDate), storeHelper
├── hooks/useInput.js   composable input form
├── features/
│   ├── auth/           api, states (useAuthStore), layouts/AuthLayout, pages/Login & Register
│   ├── users/          api, states (useUsersStore), pages/Users & Profile
│   ├── aucations/      api, states (useAucationsStore), layouts, components, modals, pages/Home & Detail
│   └── common/pages/   NotFoundPage
├── router.js           /auth/*, rute terproteksi /, /aucations/:aucationId, /users, /profile, 404
├── setupTests.js       konfigurasi Vitest + jest-dom (mock SweetAlert2 & toast-ui)
└── test-utils.js       renderWithProviders, createMockPinia
```
