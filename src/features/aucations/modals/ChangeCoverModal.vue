<script setup>
import { onBeforeUnmount, ref, watch } from "vue";
import { ImagePlus, Loader2, Upload } from "lucide-vue-next";
import BaseModal from "../components/BaseModal.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const MAX_SIZE = 2 * 1024 * 1024;

const props = defineProps({
  open: { type: Boolean, default: false },
  aucation: { type: Object, required: true },
});
const emit = defineEmits(["close", "saved"]);

const aucationsStore = useAucationsStore();
const file = ref(null);
const preview = ref("");
const error = ref("");

function clearPreview() {
  if (preview.value) URL.revokeObjectURL(preview.value);
  preview.value = "";
}

function reset() {
  clearPreview();
  file.value = null;
  error.value = "";
}

function onFileChange(event) {
  const selected = event.target.files[0];
  reset();
  if (!selected) return;
  if (!selected.type.startsWith("image/")) {
    error.value = "Berkas harus berupa gambar";
    return;
  }
  if (selected.size > MAX_SIZE) {
    error.value = "Ukuran gambar maksimal 2 MB";
    return;
  }
  file.value = selected;
  preview.value = URL.createObjectURL(selected);
}

async function onSubmit() {
  if (!file.value) {
    error.value = "Pilih gambar terlebih dahulu";
    return;
  }
  const result = await aucationsStore.changeCover(props.aucation.id, file.value);
  if (!result.success) {
    showErrorDialog(result.message);
    return;
  }
  showSuccessDialog(result.message || "Cover berhasil diperbarui");
  emit("saved");
  emit("close");
}

watch(
  () => props.open,
  (open) => {
    if (!open) reset();
  },
);

onBeforeUnmount(clearPreview);
</script>

<template>
  <BaseModal :open="open" title="Ganti Cover" description="Format JPG/PNG, maksimal 2 MB." @close="emit('close')">
    <form class="space-y-4" novalidate @submit.prevent="onSubmit">
      <label
        for="cover-input"
        class="flex aspect-video cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-indigo-400"
      >
        <img
          v-if="preview || aucation.cover"
          data-testid="cover-preview"
          :src="preview || aucation.cover"
          alt="Pratinjau cover"
          class="h-full w-full object-cover"
        />
        <template v-else>
          <ImagePlus class="h-10 w-10" />
          <span class="mt-2 text-sm">Klik untuk memilih gambar</span>
        </template>
      </label>
      <input id="cover-input" type="file" accept="image/*" class="block w-full text-sm" @change="onFileChange" />
      <p v-if="error" class="text-xs text-rose-600">{{ error }}</p>

      <div class="flex justify-end gap-2">
        <button type="button" class="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100" @click="emit('close')">
          Batal
        </button>
        <button
          type="submit"
          :disabled="aucationsStore.isAucationChangeCover"
          class="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          <component
            :is="aucationsStore.isAucationChangeCover ? Loader2 : Upload"
            :class="['h-4 w-4', { 'animate-spin': aucationsStore.isAucationChangeCover }]"
          />
          Unggah Cover
        </button>
      </div>
    </form>
  </BaseModal>
</template>
