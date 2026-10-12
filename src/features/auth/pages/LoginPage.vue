<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const authStore = useAuthStore();

const [email] = useInput("");
const [password] = useInput("");
const showPassword = ref(false);
const errors = ref({});

function validate() {
  const result = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    result.email = "Format email tidak valid";
  }
  if (password.value.length < 1) {
    result.password = "Kata sandi wajib diisi";
  }
  errors.value = result;
  return Object.keys(result).length === 0;
}

async function onSubmit() {
  if (!validate()) return;
  const result = await authStore.login(email.value.trim(), password.value);
  if (!result.success) {
    showErrorDialog(result.message);
    return;
  }
  showSuccessDialog("Selamat datang kembali!");
  router.push({ name: "home" });
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Masuk</h1>
    <p class="mt-1 text-sm text-slate-500">Masuk untuk mulai mengikuti lelang.</p>

    <form class="mt-6 space-y-4" novalidate @submit.prevent="onSubmit">
      <div>
        <label for="login-email-input" class="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
        <input
          id="login-email-input"
          v-model="email"
          name="email"
          type="email"
          autocomplete="email"
          placeholder="nama@email.com"
          class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
        <p v-if="errors.email" class="mt-1 text-xs text-rose-600">{{ errors.email }}</p>
      </div>

      <div>
        <label for="login-password-input" class="mb-1.5 block text-sm font-medium text-slate-700">Kata Sandi</label>
        <div class="relative">
          <input
            id="login-password-input"
            v-model="password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-11 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
          <button
            type="button"
            data-testid="toggle-password"
            :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
            class="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-slate-600"
            @click="showPassword = !showPassword"
          >
            <component :is="showPassword ? EyeOff : Eye" class="h-4 w-4" />
          </button>
        </div>
        <p v-if="errors.password" class="mt-1 text-xs text-rose-600">{{ errors.password }}</p>
      </div>

      <button
        id="login-submit-button"
        type="submit"
        :disabled="authStore.isAuthLogin"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <component
          :is="authStore.isAuthLogin ? Loader2 : LogIn"
          :class="['h-4 w-4', { 'animate-spin': authStore.isAuthLogin }]"
        />
        {{ authStore.isAuthLogin ? "Memproses..." : "Masuk" }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Belum punya akun?
      <RouterLink to="/auth/register" class="font-semibold text-indigo-600 hover:underline">
        Daftar sekarang
      </RouterLink>
    </p>
  </div>
</template>
