<script setup>
import { ref } from "vue";
import { Loader2, Save } from "lucide-vue-next";
import MarkdownEditor from "./MarkdownEditor.vue";
import { useInput } from "../../../hooks/useInput";
import { validateAucationForm } from "../utils/aucationForm";

const props = defineProps({
  initial: {
    type: Object,
    default: () => ({ title: "", description: "", startBid: "", closedAt: "" }),
  },
  submitting: { type: Boolean, default: false },
  submitLabel: { type: String, default: "Simpan" },
  requireFuture: { type: Boolean, default: true },
});
const emit = defineEmits(["submit", "cancel"]);

const [title] = useInput(props.initial.title);
const [description] = useInput(props.initial.description);
const [startBid] = useInput(props.initial.startBid);
const [closedAt] = useInput(props.initial.closedAt);
const errors = ref({});

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

function onSubmit() {
  const values = {
    title: title.value,
    description: description.value,
    startBid: startBid.value,
    closedAt: closedAt.value,
  };
  errors.value = validateAucationForm(values, { requireFuture: props.requireFuture });
  if (Object.keys(errors.value).length > 0) return;
  emit("submit", values);
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
    <div>
      <label for="aucation-title" class="mb-1.5 block text-sm font-medium text-slate-700">Judul Barang</label>
      <input id="aucation-title" v-model="title" type="text" placeholder="Contoh: Kamera Mirrorless" :class="inputClass" />
      <p v-if="errors.title" class="mt-1 text-xs text-rose-600">{{ errors.title }}</p>
    </div>

    <div>
      <span class="mb-1.5 block text-sm font-medium text-slate-700">Deskripsi</span>
      <MarkdownEditor v-model="description" />
      <p v-if="errors.description" class="mt-1 text-xs text-rose-600">{{ errors.description }}</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label for="aucation-start-bid" class="mb-1.5 block text-sm font-medium text-slate-700">Harga Awal (Rp)</label>
        <input id="aucation-start-bid" v-model="startBid" type="number" min="1" placeholder="100000" :class="inputClass" />
        <p v-if="errors.startBid" class="mt-1 text-xs text-rose-600">{{ errors.startBid }}</p>
      </div>
      <div>
        <label for="aucation-closed-at" class="mb-1.5 block text-sm font-medium text-slate-700">Batas Waktu</label>
        <input id="aucation-closed-at" v-model="closedAt" type="datetime-local" :class="inputClass" />
        <p v-if="errors.closedAt" class="mt-1 text-xs text-rose-600">{{ errors.closedAt }}</p>
      </div>
    </div>

    <div class="flex justify-end gap-2 pt-2">
      <button
        type="button"
        class="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        @click="emit('cancel')"
      >
        Batal
      </button>
      <button
        type="submit"
        :disabled="submitting"
        class="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        <component :is="submitting ? Loader2 : Save" :class="['h-4 w-4', { 'animate-spin': submitting }]" />
        {{ submitLabel }}
      </button>
    </div>
  </form>
</template>
