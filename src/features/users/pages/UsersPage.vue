<script setup>
import { computed, onMounted } from "vue";
import { Loader2, Mail, Search, UsersRound } from "lucide-vue-next";
import { useUsersStore } from "../states/usersStore";
import { useInput } from "../../../hooks/useInput";
import { formatDate, showErrorDialog } from "../../../helpers/toolsHelper";

const usersStore = useUsersStore();
const [keyword] = useInput("");

const filteredUsers = computed(() => {
  const search = keyword.value.trim().toLowerCase();
  return usersStore.users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(search));
});

onMounted(async () => {
  const result = await usersStore.getUsers();
  if (!result.success) showErrorDialog(result.message);
});
</script>

<template>
  <section>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Daftar Pengguna</h1>
        <p class="mt-1 text-sm text-slate-500">{{ usersStore.users.length }} pengguna terdaftar di Delcom Auction.</p>
      </div>
      <label class="relative block sm:w-72">
        <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          v-model="keyword"
          type="search"
          data-testid="users-search"
          placeholder="Cari nama atau email..."
          class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
      </label>
    </div>

    <div v-if="usersStore.isUsers" class="flex justify-center py-20 text-slate-500">
      <Loader2 class="h-6 w-6 animate-spin" />
    </div>

    <div
      v-else-if="filteredUsers.length === 0"
      data-testid="users-empty"
      class="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white py-16"
    >
      <UsersRound class="h-12 w-12 text-slate-300" />
      <p class="mt-3 text-sm text-slate-500">Tidak ada pengguna ditemukan.</p>
    </div>

    <ul v-else class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <li
        v-for="user in filteredUsers"
        :key="user.id"
        data-testid="user-item"
        class="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4"
      >
        <img v-if="user.photo" :src="user.photo" :alt="user.name" class="h-12 w-12 rounded-full object-cover" />
        <span v-else class="grid h-12 w-12 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700">
          {{ user.name.charAt(0).toUpperCase() }}
        </span>
        <div class="min-w-0">
          <p class="truncate font-semibold text-slate-900">{{ user.name }}</p>
          <p class="flex items-center gap-1 truncate text-sm text-slate-500"><Mail class="h-3.5 w-3.5" /> {{ user.email }}</p>
          <p class="text-xs text-slate-400">Bergabung {{ formatDate(user.created_at) }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>
