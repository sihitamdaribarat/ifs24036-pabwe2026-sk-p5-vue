<script setup>
import { onMounted, ref } from "vue";
import { RouterView } from "vue-router";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";
import { useUsersStore } from "../../users/states/usersStore";

const usersStore = useUsersStore();
const isSidebarOpen = ref(false);

onMounted(() => {
  usersStore.getProfile();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <SidebarComponent :open="isSidebarOpen" @close="isSidebarOpen = false" />
    <div class="lg:pl-64">
      <NavbarComponent @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
      <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
