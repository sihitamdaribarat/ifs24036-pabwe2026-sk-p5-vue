<script setup>
import { computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { LogOut, Menu, Plus, UserRound } from "lucide-vue-next";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

const emit = defineEmits(["toggle-sidebar"]);

const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();

const profile = computed(() => usersStore.profile);
const initial = computed(() => (profile.value?.name ?? "?").charAt(0).toUpperCase());

async function onLogout() {
  const confirmed = await showConfirmDialog("Kamu akan keluar dari akun ini.", "Keluar?", "Ya, keluar");
  if (!confirmed) return;
  await authStore.logout();
  usersStore.clearProfile();
  router.push({ name: "login" });
}
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        data-testid="toggle-sidebar"
        aria-label="Buka menu"
        class="grid h-10 w-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
        @click="emit('toggle-sidebar')"
      >
        <Menu class="h-5 w-5" />
      </button>

      <div class="flex-1" />

      <RouterLink
        :to="{ name: 'home', query: { add: '1' } }"
        class="hidden items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 sm:flex"
      >
        <Plus class="h-4 w-4" /> Buat Lelang
      </RouterLink>

      <RouterLink
        to="/profile"
        data-testid="navbar-profile"
        class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-100"
      >
        <img
          v-if="profile?.photo"
          :src="profile.photo"
          alt="Foto profil"
          class="h-9 w-9 rounded-full object-cover ring-2 ring-white"
        />
        <span
          v-else
          class="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700"
        >
          {{ initial }}
        </span>
        <span class="hidden text-left leading-tight md:block">
          <span class="block text-sm font-semibold text-slate-800">{{ profile?.name ?? "Memuat..." }}</span>
          <span class="block text-xs text-slate-500">{{ profile?.email ?? "" }}</span>
        </span>
        <UserRound class="h-4 w-4 text-slate-400 md:hidden" />
      </RouterLink>

      <button
        type="button"
        data-testid="logout-button"
        :disabled="authStore.isAuthLogout"
        class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
        @click="onLogout"
      >
        <LogOut class="h-4 w-4" />
        <span class="hidden sm:inline">Keluar</span>
      </button>
    </div>
  </header>
</template>
