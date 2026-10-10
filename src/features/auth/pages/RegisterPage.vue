<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { Loader2, UserPlus } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const authStore = useAuthStore();

const [name] = useInput("");
const [email] = useInput("");
const [password] = useInput("");
const [passwordConfirmation] = useInput("");
const errors = ref({});

const fields = [
  { id: "name", label: "Nama Lengkap", type: "text", model: name, autocomplete: "name", placeholder: "Nama kamu" },
  { id: "email", label: "Email", type: "email", model: email, autocomplete: "email", placeholder: "nama@email.com" },
  { id: "password", label: "Kata Sandi", type: "password", model: password, autocomplete: "new-password", placeholder: "Minimal 8 karakter" },
  {
    id: "passwordConfirmation",
    label: "Konfirmasi Kata Sandi",
    type: "password",
    model: passwordConfirmation,
    autocomplete: "new-password",
    placeholder: "Ulangi kata sandi",
  },
];

function validate() {
  const result = {};
  if (name.value.trim().length < 3) {
    result.name = "Nama minimal 3 karakter";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    result.email = "Format email tidak valid";
  }
  if (password.value.length < 8) {
    result.password = "Kata sandi minimal 8 karakter";
  }
  if (passwordConfirmation.value !== password.value) {
    result.passwordConfirmation = "Konfirmasi kata sandi tidak sama";
  }
  errors.value = result;
  return Object.keys(result).length === 0;
}

async function onSubmit() {
  if (!validate()) return;
  const result = await authStore.register(name.value.trim(), email.value.trim(), password.value);
  if (!result.success) {
    showErrorDialog(result.message);
    return;
  }
  await showSuccessDialog(result.message || "Akun berhasil dibuat, silakan masuk.");
  router.push({ name: "login" });
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-slate-900">Buat Akun</h2>
    <p class="mt-1 text-sm text-slate-500">Daftar gratis dan mulai ikut lelang.</p>

    <form class="mt-6 space-y-4" novalidate @submit.prevent="onSubmit">
      <div v-for="field in fields" :key="field.id">
        <label :for="field.id" class="mb-1.5 block text-sm font-medium text-slate-700">{{ field.label }}</label>
        <input
          :id="field.id"
          v-model="field.model.value"
          :type="field.type"
          :autocomplete="field.autocomplete"
          :placeholder="field.placeholder"
          class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
        <p v-if="errors[field.id]" class="mt-1 text-xs text-rose-600">{{ errors[field.id] }}</p>
      </div>

      <button
        type="submit"
        :disabled="authStore.isAuthRegister"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <component
          :is="authStore.isAuthRegister ? Loader2 : UserPlus"
          :class="['h-4 w-4', { 'animate-spin': authStore.isAuthRegister }]"
        />
        {{ authStore.isAuthRegister ? "Memproses..." : "Daftar" }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Sudah punya akun?
      <RouterLink to="/auth/login" class="font-semibold text-indigo-600 hover:underline">Masuk</RouterLink>
    </p>
  </div>
</template>
