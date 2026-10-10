<script setup>
import { ref, watch } from "vue";
import { Camera, KeyRound, Loader2, Save } from "lucide-vue-next";
import { useUsersStore } from "../states/usersStore";
import { useInput } from "../../../hooks/useInput";
import { formatDate, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const usersStore = useUsersStore();

const [name, , setName] = useInput("");
const [email, , setEmail] = useInput("");
const [password, , setPassword] = useInput("");
const [newPassword, , setNewPassword] = useInput("");
const [newPasswordConfirmation, , setNewPasswordConfirmation] = useInput("");
const profileErrors = ref({});
const passwordErrors = ref({});
const photoInput = ref(null);

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

watch(
  () => usersStore.profile,
  (profile) => {
    setName(profile?.name ?? "");
    setEmail(profile?.email ?? "");
  },
  { immediate: true },
);

async function onSaveProfile() {
  const errors = {};
  if (name.value.trim().length < 3) errors.name = "Nama minimal 3 karakter";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) errors.email = "Format email tidak valid";
  profileErrors.value = errors;
  if (Object.keys(errors).length > 0) return;

  const result = await usersStore.changeProfile(name.value.trim(), email.value.trim());
  if (!result.success) {
    showErrorDialog(result.message);
    return;
  }
  showSuccessDialog(result.message || "Profil berhasil diperbarui");
}

async function onPhotoChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showErrorDialog("Berkas harus berupa gambar");
    return;
  }
  const result = await usersStore.changePhoto(file);
  event.target.value = "";
  if (!result.success) {
    showErrorDialog(result.message);
    return;
  }
  showSuccessDialog(result.message || "Foto profil berhasil diperbarui");
}

async function onChangePassword() {
  const errors = {};
  if (password.value.length < 1) errors.password = "Kata sandi lama wajib diisi";
  if (newPassword.value.length < 8) errors.newPassword = "Kata sandi baru minimal 8 karakter";
  if (newPasswordConfirmation.value !== newPassword.value) {
    errors.newPasswordConfirmation = "Konfirmasi kata sandi tidak sama";
  }
  passwordErrors.value = errors;
  if (Object.keys(errors).length > 0) return;

  const result = await usersStore.changePassword(password.value, newPassword.value, newPasswordConfirmation.value);
  if (!result.success) {
    showErrorDialog(result.message);
    return;
  }
  setPassword("");
  setNewPassword("");
  setNewPasswordConfirmation("");
  showSuccessDialog(result.message || "Kata sandi berhasil diubah");
}
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Profil Saya</h1>
      <p class="mt-1 text-sm text-slate-500">Kelola informasi akun dan keamanan kamu.</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <div class="relative mx-auto h-28 w-28">
          <img
            v-if="usersStore.profile?.photo"
            :src="usersStore.profile.photo"
            alt="Foto profil"
            data-testid="profile-photo"
            class="h-28 w-28 rounded-full object-cover ring-4 ring-indigo-50"
          />
          <span v-else class="grid h-28 w-28 place-items-center rounded-full bg-indigo-100 text-4xl font-bold text-indigo-700">
            {{ (usersStore.profile?.name ?? "?").charAt(0).toUpperCase() }}
          </span>
          <button
            type="button"
            data-testid="change-photo"
            aria-label="Ganti foto profil"
            :disabled="usersStore.isPhotoChange"
            class="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full bg-indigo-600 text-white shadow ring-4 ring-white hover:bg-indigo-700 disabled:opacity-60"
            @click="photoInput.click()"
          >
            <component :is="usersStore.isPhotoChange ? Loader2 : Camera" :class="['h-4 w-4', { 'animate-spin': usersStore.isPhotoChange }]" />
          </button>
          <input ref="photoInput" data-testid="photo-input" type="file" accept="image/*" class="hidden" @change="onPhotoChange" />
        </div>
        <p class="mt-4 text-lg font-bold text-slate-900">{{ usersStore.profile?.name ?? "-" }}</p>
        <p class="text-sm text-slate-500">{{ usersStore.profile?.email ?? "-" }}</p>
        <p class="mt-3 text-xs text-slate-400">Bergabung {{ formatDate(usersStore.profile?.created_at) }}</p>
      </div>

      <div class="space-y-6 lg:col-span-2">
        <form class="rounded-2xl border border-slate-200 bg-white p-6" novalidate data-testid="profile-form" @submit.prevent="onSaveProfile">
          <h2 class="text-lg font-bold text-slate-900">Informasi Akun</h2>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label for="profile-name" class="mb-1.5 block text-sm font-medium text-slate-700">Nama</label>
              <input id="profile-name" v-model="name" type="text" :class="inputClass" />
              <p v-if="profileErrors.name" class="mt-1 text-xs text-rose-600">{{ profileErrors.name }}</p>
            </div>
            <div>
              <label for="profile-email" class="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input id="profile-email" v-model="email" type="email" :class="inputClass" />
              <p v-if="profileErrors.email" class="mt-1 text-xs text-rose-600">{{ profileErrors.email }}</p>
            </div>
          </div>
          <div class="mt-5 flex justify-end">
            <button
              type="submit"
              :disabled="usersStore.isProfileChange"
              class="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              <component :is="usersStore.isProfileChange ? Loader2 : Save" :class="['h-4 w-4', { 'animate-spin': usersStore.isProfileChange }]" />
              Simpan Profil
            </button>
          </div>
        </form>

        <form class="rounded-2xl border border-slate-200 bg-white p-6" novalidate data-testid="password-form" @submit.prevent="onChangePassword">
          <h2 class="text-lg font-bold text-slate-900">Ganti Kata Sandi</h2>
          <div class="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label for="current-password" class="mb-1.5 block text-sm font-medium text-slate-700">Kata Sandi Lama</label>
              <input id="current-password" v-model="password" type="password" autocomplete="current-password" :class="inputClass" />
              <p v-if="passwordErrors.password" class="mt-1 text-xs text-rose-600">{{ passwordErrors.password }}</p>
            </div>
            <div>
              <label for="new-password" class="mb-1.5 block text-sm font-medium text-slate-700">Kata Sandi Baru</label>
              <input id="new-password" v-model="newPassword" type="password" autocomplete="new-password" :class="inputClass" />
              <p v-if="passwordErrors.newPassword" class="mt-1 text-xs text-rose-600">{{ passwordErrors.newPassword }}</p>
            </div>
            <div>
              <label for="new-password-confirmation" class="mb-1.5 block text-sm font-medium text-slate-700">Konfirmasi</label>
              <input
                id="new-password-confirmation"
                v-model="newPasswordConfirmation"
                type="password"
                autocomplete="new-password"
                :class="inputClass"
              />
              <p v-if="passwordErrors.newPasswordConfirmation" class="mt-1 text-xs text-rose-600">
                {{ passwordErrors.newPasswordConfirmation }}
              </p>
            </div>
          </div>
          <div class="mt-5 flex justify-end">
            <button
              type="submit"
              :disabled="usersStore.isPasswordChange"
              class="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              <component :is="usersStore.isPasswordChange ? Loader2 : KeyRound" :class="['h-4 w-4', { 'animate-spin': usersStore.isPasswordChange }]" />
              Ganti Kata Sandi
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
