<script setup>
import { RouterLink } from "vue-router";
import { Home, SearchX } from "lucide-vue-next";
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
    <span class="grid h-20 w-20 place-items-center rounded-2xl bg-indigo-100 text-indigo-600">
      <SearchX class="h-10 w-10" />
    </span>
    <p class="mt-6 text-6xl font-extrabold text-slate-900">404</p>
    <h1 class="mt-2 text-xl font-bold text-slate-800">Halaman tidak ditemukan</h1>
    <p class="mt-2 max-w-sm text-sm text-slate-500">
      Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
    </p>
    <RouterLink
      to="/"
      class="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
    >
      <Home class="h-4 w-4" /> Kembali ke Beranda
    </RouterLink>
  </main>
</template>
