<script setup>
import { RouterLink, useRoute } from "vue-router";
import { Gavel, LayoutDashboard, Package, UserCircle, Users, X } from "lucide-vue-next";

defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(["close"]);

const route = useRoute();

const menus = [
  { label: "Dashboard Lelang", icon: LayoutDashboard, to: { name: "home" }, match: (r) => r.name === "home" && r.query.tab !== "mine" },
  { label: "Lelang Saya", icon: Package, to: { name: "home", query: { tab: "mine" } }, match: (r) => r.name === "home" && r.query.tab === "mine" },
  { label: "Daftar Pengguna", icon: Users, to: { name: "users" }, match: (r) => r.name === "users" },
  { label: "Profil Saya", icon: UserCircle, to: { name: "profile" }, match: (r) => r.name === "profile" },
];
</script>

<template>
  <div>
    <div
      v-if="open"
      data-testid="sidebar-backdrop"
      class="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
      @click="emit('close')"
    />
    <aside
      data-testid="sidebar"
      :class="[
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div class="flex h-16 items-center justify-between px-5">
        <RouterLink to="/" class="flex items-center gap-2.5" @click="emit('close')">
          <span class="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
            <Gavel class="h-5 w-5" />
          </span>
          <span class="font-bold tracking-tight text-slate-900">Delcom Auction</span>
        </RouterLink>
        <button
          type="button"
          data-testid="close-sidebar"
          aria-label="Tutup menu"
          class="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          @click="emit('close')"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <nav class="flex-1 space-y-1 px-3 py-4">
        <p class="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Menu</p>
        <RouterLink
          v-for="menu in menus"
          :key="menu.label"
          :to="menu.to"
          :class="[
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
            menu.match(route) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          ]"
          @click="emit('close')"
        >
          <component :is="menu.icon" class="h-5 w-5" />
          {{ menu.label }}
        </RouterLink>
      </nav>

      <div class="m-3 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 p-4 text-white">
        <p class="text-sm font-semibold">Punya barang untuk dilelang?</p>
        <p class="mt-1 text-xs text-indigo-100">Buat lelang baru dan dapatkan penawaran terbaik.</p>
        <RouterLink
          :to="{ name: 'home', query: { add: '1' } }"
          class="mt-3 inline-block rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700"
          @click="emit('close')"
        >
          Buat Lelang
        </RouterLink>
      </div>
    </aside>
  </div>
</template>
