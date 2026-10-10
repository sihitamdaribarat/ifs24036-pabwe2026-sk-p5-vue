<script setup>
import { RouterView } from "vue-router";
import { Gavel, ShieldCheck, Timer, TrendingUp } from "lucide-vue-next";

const highlights = [
  { icon: TrendingUp, text: "Pantau tawaran tertinggi secara langsung" },
  { icon: Timer, text: "Hitung mundur penutupan setiap lelang" },
  { icon: ShieldCheck, text: "Akun dan tawaran kamu tersimpan aman" },
];
</script>

<template>
  <div class="grid min-h-screen bg-slate-50 lg:grid-cols-2">
    <aside
      data-testid="auth-banner"
      class="relative hidden flex-col justify-between overflow-hidden bg-indigo-700 p-12 text-white lg:flex"
    >
      <div class="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/40 blur-3xl" />
      <div class="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-fuchsia-500/30 blur-3xl" />

      <div class="relative flex items-center gap-3">
        <span class="grid h-11 w-11 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25">
          <Gavel class="h-6 w-6" />
        </span>
        <span class="text-xl font-bold tracking-tight">Delcom Auction</span>
      </div>

      <div class="relative max-w-md">
        <h1 class="text-4xl font-extrabold leading-tight">
          Lelang barang favoritmu, kapan saja.
        </h1>
        <p class="mt-4 text-indigo-100">
          Buat lelang, ajukan penawaran, dan menangkan barang incaranmu di satu tempat.
        </p>
        <ul class="mt-8 space-y-4">
          <li v-for="item in highlights" :key="item.text" class="flex items-center gap-3">
            <span class="grid h-9 w-9 place-items-center rounded-lg bg-white/10">
              <component :is="item.icon" class="h-5 w-5" />
            </span>
            <span class="text-sm text-indigo-50">{{ item.text }}</span>
          </li>
        </ul>
      </div>

      <p class="relative text-xs text-indigo-200">&copy; 2026 Delcom Auction · PABWE</p>
    </aside>

    <main class="flex items-center justify-center px-4 py-12 sm:px-8">
      <div class="w-full max-w-md">
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <span class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white">
            <Gavel class="h-5 w-5" />
          </span>
          <span class="text-lg font-bold">Delcom Auction</span>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <RouterView />
        </div>
      </div>
    </main>
  </div>
</template>
